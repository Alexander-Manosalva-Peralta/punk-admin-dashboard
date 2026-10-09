-- ========================================================
-- PUNK ENTERPRISE - SUPABASE DATABASE SCHEMA (POSTGRESQL)
-- ========================================================
-- Ejecutar este script en el SQL Editor de Supabase (https://app.supabase.com)

-- 1. Tabla de Comercios y Licencias
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) DEFAULT 'Plan Pro 30 Días',
    days_duration INT DEFAULT 30,
    price_soles DECIMAL(10, 2) DEFAULT 35.00,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, SUSPENDED
    bound_device_id VARCHAR(255) DEFAULT NULL, -- Bloqueo anti-piratería
    first_login_at TIMESTAMPTZ DEFAULT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Registros de Conexión de Dispositivos (Auditoría)
CREATE TABLE IF NOT EXISTS public.device_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'LOGIN_SUCCESS', 'DEVICE_BLOCKED', 'DEVICE_RESET'
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para consultas de alta velocidad
CREATE INDEX IF NOT EXISTS idx_merchants_email ON public.merchants(email);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON public.merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_device ON public.merchants(bound_device_id);

-- 4. Datos Iniciales de Prueba
INSERT INTO public.merchants (business_name, email, password_hash, plan_name, days_duration, price_soles, status, expires_at)
VALUES 
('Bodega Don Pepe', 'donpepe@gmail.com', 'pepe2026', 'Plan Pro 30 Días', 30, 35.00, 'ACTIVE', NOW() + INTERVAL '28 days'),
('Farmacia Santa Rosa', 'santarosa@gmail.com', 'rosa2026', 'Plan Trimestral 90 Días', 90, 95.00, 'ACTIVE', NOW() + INTERVAL '84 days'),
('Minimarket Los Olivos', 'losolivos@gmail.com', 'olivos2026', 'Plan Anual 365 Días', 365, 320.00, 'ACTIVE', NOW() + INTERVAL '350 days'),
('Librería San Martín', 'sanmartin@gmail.com', 'martin2026', 'Plan Pro 30 Días', 30, 35.00, 'EXPIRED', NOW() - INTERVAL '2 days')
ON CONFLICT (email) DO NOTHING;
