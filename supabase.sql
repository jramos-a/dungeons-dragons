create table public.users (
  username text primary key,
  salt text not null,
  hash text not null,
  char jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.sessions (
  token text primary key,
  username text not null references public.users(username) on delete cascade,
  created_at timestamptz not null default now()
);

-- Sin políticas: la clave pública no puede leer nada.
-- Solo las funciones de Vercel (con la clave secreta) acceden.
alter table public.users enable row level security;
alter table public.sessions enable row level security;
