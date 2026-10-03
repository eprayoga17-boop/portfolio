-- Run after shim + migration + seed. Every check raises on failure.
\set ON_ERROR_STOP on
insert into auth.users values ('11111111-1111-1111-1111-111111111111', 'erik@example.com'),
                              ('22222222-2222-2222-2222-222222222222', 'stranger@example.com');
insert into public.admins (user_id) values ('11111111-1111-1111-1111-111111111111');
update public.projects set published = false where slug = 'meda';

create or replace function pg_temp.as_user(p_role text, p_sub text, p_aal text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_sub, 'aal', p_aal, 'role', p_role)::text, false);
  execute format('set role %I', p_role);
end $$;

-- 1. anon sees only published projects and cannot write
select pg_temp.as_user('anon', '', '');
do $$ begin
  if (select count(*) from public.projects where slug = 'meda') <> 0 then raise exception 'anon saw a draft'; end if;
  if (select count(*) from public.projects) <> 27 then raise exception 'anon project count wrong: %', (select count(*) from public.projects); end if;
  begin insert into public.projects (slug,title,client,category,summary) values ('x','x','x','fnb','x'); raise exception 'anon insert allowed';
  exception when insufficient_privilege then null; end;
  begin perform 1 from public.inquiries; raise exception 'anon read inquiries';
  exception when insufficient_privilege then null; end;
  begin perform public.check_rate_limit('k', 1, 60); raise exception 'anon ran rate limiter';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 2. a signed-in non-admin is no better than anon
select pg_temp.as_user('authenticated', '22222222-2222-2222-2222-222222222222', 'aal2');
do $$ begin
  if (select count(*) from public.projects where slug = 'meda') <> 0 then raise exception 'stranger saw a draft'; end if;
  insert into public.projects (slug,title,client,category,summary) values ('evil','x','x','fnb','x');
  raise exception 'stranger insert allowed';
exception when insufficient_privilege then null; end $$;
reset role;

-- 3. admin without MFA (aal1) cannot write
select pg_temp.as_user('authenticated', '11111111-1111-1111-1111-111111111111', 'aal1');
do $$ begin
  insert into public.projects (slug,title,client,category,summary) values ('nomfa','x','x','fnb','x');
  raise exception 'aal1 admin insert allowed';
exception when insufficient_privilege then null; end $$;
reset role;

-- 4. admin with MFA can do everything content-related, and it is audited
select pg_temp.as_user('authenticated', '11111111-1111-1111-1111-111111111111', 'aal2');
do $$ declare v_id uuid; begin
  if (select count(*) from public.projects where slug = 'meda') <> 1 then raise exception 'admin cannot see draft'; end if;
  insert into public.projects (slug,title,client,category,summary) values ('new-one','New','C','beauty','S') returning id into v_id;
  update public.projects set title = 'Renamed' where id = v_id;
  insert into public.project_images (project_id, path, alt, width, height) values (v_id, 'projects/x.webp', 'alt', 10, 10);
  if (select count(*) from public.audit_log where entity = 'projects' and entity_id = v_id::text and actor = auth.uid()) <> 2 then
    raise exception 'audit rows missing for admin writes';
  end if;
  if (select updated_by from public.projects where id = v_id) <> auth.uid() then raise exception 'updated_by not set'; end if;
  begin update public.audit_log set action = 'forged'; raise exception 'audit log editable';
  exception when insufficient_privilege then null; end;
  begin delete from public.audit_log; raise exception 'audit log deletable';
  exception when insufficient_privilege then null; end;
  begin insert into public.inquiries (name,email,project_type,message,consent,consent_version) values ('a','a@b.co','other','0123456789',true,'v');
    raise exception 'admin inserted inquiry directly';
  exception when insufficient_privilege then null; end;
  -- storage: only into projects/ folder
  insert into storage.objects (bucket_id, name) values ('portfolio', 'projects/abc/file.webp');
  begin insert into storage.objects (bucket_id, name) values ('portfolio', 'elsewhere/file.webp'); raise exception 'storage outside projects/ allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 5. stranger cannot write to storage
select pg_temp.as_user('authenticated', '22222222-2222-2222-2222-222222222222', 'aal2');
do $$ begin
  insert into storage.objects (bucket_id, name) values ('portfolio', 'projects/abc/evil.webp');
  raise exception 'stranger storage insert allowed';
exception when insufficient_privilege then null; end $$;
reset role;

-- 6. service role: contact insert, rate limiter, retention
set role service_role;
do $$ begin
  insert into public.inquiries (name,email,project_type,message,consent,consent_version,created_at)
    values ('Old','old@example.com','other','old message here',true,'v', now() - interval '400 days'),
           ('New','new@example.com','freelance','new message here',true,'v', now());
  begin insert into public.inquiries (name,email,project_type,message,consent,consent_version) values ('x','x@y.co','other','0123456789',false,'v');
    raise exception 'inquiry without consent accepted';
  exception when check_violation then null; end;
  if not public.check_rate_limit('t', 2, 60) then raise exception 'rl 1'; end if;
  if not public.check_rate_limit('t', 2, 60) then raise exception 'rl 2'; end if;
  if public.check_rate_limit('t', 2, 60) then raise exception 'rl 3 should block'; end if;
  if public.purge_expired_data(365) <> 1 then raise exception 'purge count wrong'; end if;
  if (select count(*) from public.inquiries) <> 1 then raise exception 'purge removed wrong rows'; end if;
end $$;
reset role;

-- 7. constraint checks
do $$ begin
  begin insert into public.projects (slug,title,client,category,summary) values ('Bad Slug!','x','x','fnb','x'); raise exception 'bad slug accepted';
  exception when check_violation then null; end;
  begin insert into public.projects (slug,title,client,category,summary,external_url) values ('ok-slug','x','x','fnb','x','javascript:alert(1)'); raise exception 'js url accepted';
  exception when check_violation then null; end;
end $$;

select 'ALL RLS TESTS PASSED' as result;
