import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth/useAuth';
import {
  PERSONAS,
  personaToRole,
  roleToPersona,
  defaultRouteForPersona,
  type Persona,
} from '@/app/auth/roles';

/**
 * 4-pill persona switcher used in the sidebar. Switching a persona swaps the
 * principal's role (preserving id/tenant) and navigates to that persona's home.
 */
export function RoleSwitcher() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const active: Persona = user ? roleToPersona(user.role) : 'admin';

  const select = (persona: Persona) => {
    if (!user || !token || persona === active) return;
    login({ ...user, role: personaToRole(persona) }, token);
    navigate(defaultRouteForPersona(persona));
  };

  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--color-muted)',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          padding: '2px 4px 6px',
        }}
      >
        Vai trò
      </div>
      <div
        style={{
          display: 'flex',
          background: 'var(--color-input-bg)',
          borderRadius: 8,
          padding: 2,
          gap: 1,
        }}
      >
        {PERSONAS.map((p) => {
          const isActive = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => select(p.id)}
              style={{
                flex: 1,
                padding: '6px 2px',
                textAlign: 'center',
                borderRadius: 6,
                border: 'none',
                fontSize: 10.5,
                fontWeight: 500,
                cursor: 'pointer',
                background: isActive ? 'var(--color-blue)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-muted)',
                transition: 'all .15s',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
