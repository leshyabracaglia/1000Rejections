-- Lets a signed-in user permanently delete their own account and all of
-- their data (rejections + uploaded images), satisfying App Store
-- Guideline 5.1.1(v) which requires an in-app account deletion path.
--
-- Called from the client as: supabase.rpc('delete_user')
--
-- Runs as SECURITY DEFINER (owned by the migration role, which has rights
-- on auth.users) so an authenticated user can delete their own auth.users
-- row without needing elevated client-side privileges. search_path is
-- pinned to avoid function-search-path hijacking.
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from storage.objects
  where bucket_id = 'rejection-images'
    and (storage.foldername(name))[1] = uid::text;

  delete from public.rejections where user_id = uid;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
