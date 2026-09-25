{{- define "portfolio.labels" -}}
app.kubernetes.io/name: portfolio
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Values.image.tag | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{- define "portfolio.selectorLabels" -}}
app.kubernetes.io/name: portfolio
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
