-- Execute estes comandos no SQL Editor do Neon PostgreSQL se desejar aplicar manualmente
-- (O servidor também verifica e cria estas colunas automaticamente ao iniciar)
ALTER TABLE prestador
ADD COLUMN IF NOT EXISTS formas_pagamento TEXT;

ALTER TABLE solicitante
ADD COLUMN IF NOT EXISTS foto_perfil TEXT;
