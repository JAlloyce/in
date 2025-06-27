create function increment_follower_count(p_company_id uuid)
returns void as $$
  update public.companies
  set follower_count = follower_count + 1
  where id = p_company_id;
$$ language sql volatile;

create function decrement_follower_count(p_company_id uuid)
returns void as $$
  update public.companies
  set follower_count = greatest(0, follower_count - 1)
  where id = p_company_id;
$$ language sql volatile; 