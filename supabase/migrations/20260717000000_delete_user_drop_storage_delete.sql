-- storage.objects has a protective trigger that rejects direct SQL DELETEs
-- ("Direct deletion from storage tables is not allowed. Use the Storage API
-- instead.") -- it exists so the object metadata row can't get out of sync
-- with the actual file in the bucket. That made every delete_user() call
-- fail. Image cleanup now happens client-side via the Storage API
-- (supabase.storage.from(...).remove(...)) before this RPC is called.
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

  delete from public.rejections where user_id = uid;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
