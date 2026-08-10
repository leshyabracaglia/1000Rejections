-- Computes what percentile the caller's rejection count falls in, without
-- shipping every user's rows to the client just to count them there.
--
-- Called from the client as:
--   supabase.rpc('rejection_count_percentile', { my_count: n })
--
-- security definer: aggregates across all users' rejection counts, which a
-- caller wouldn't otherwise be able to see under per-user RLS. Only a single
-- rounded integer is ever returned -- no row-level data is exposed.
create or replace function public.rejection_count_percentile(my_count integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with counts as (
    select count(*) as cnt
    from public.rejections
    group by user_id
  )
  select case
    when not exists (select 1 from counts) then null
    else round(
      100.0 * (select count(*) from counts where cnt < my_count)
      / (select count(*) from counts)
    )::integer
  end;
$$;

revoke all on function public.rejection_count_percentile(integer) from public, anon;
grant execute on function public.rejection_count_percentile(integer) to authenticated;
