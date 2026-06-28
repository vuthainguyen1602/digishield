{{/* Database env (DB_URL/USERNAME/PASSWORD) — shared by api/worker/scheduler/flyway. */}}
{{- define "digishield.dbEnv" -}}
- name: DB_URL
  value: {{ .Values.database.url | quote }}
- name: DB_USERNAME
  value: {{ .Values.database.username | quote }}
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.database.existingSecret }}
      key: {{ .Values.database.passwordKey }}
{{- end -}}

{{/* OAuth2 resource-server issuer — shared by api/worker/scheduler/flyway. The
     app boots a JwtDecoder from this OIDC issuer (e.g. a Cognito user pool). */}}
{{- define "digishield.authEnv" -}}
{{- with .Values.auth.issuerUri }}
- name: SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI
  value: {{ . | quote }}
{{- end }}
{{- end -}}

{{/* Redis env — shared by api/worker/scheduler (REDIS_PASSWORD only when a secret is set). */}}
{{- define "digishield.redisEnv" -}}
- name: REDIS_HOST
  value: {{ .Values.redis.host | quote }}
- name: REDIS_PORT
  value: {{ .Values.redis.port | quote }}
- name: REDIS_SSL
  value: {{ .Values.redis.tls | quote }}
{{- if .Values.redis.existingSecret }}
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.redis.existingSecret }}
      key: {{ .Values.redis.passwordKey }}
{{- end }}
{{- end -}}
