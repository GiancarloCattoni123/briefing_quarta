# Configuração de Backend para o Frontend (React/Vite)

Para consumir nosso backend corretamente (lidando com CORS, Cookies de Autenticação, etc), adicione o arquivo de variáveis de ambiente no root do seu repositório Front-end.

Crie um arquivo `.env` na raiz do seu projeto React contendo a seguinte informação:

```env
VITE_API_URL=http://localhost:3001
```

O prefixo `VITE_` é importante para que o React Vite consiga injetar o valor corretamente no contexto do Javascript rodando na página.

### Notas para as Chamadas (Axios SDK)
1. **Padrão de Resposta**: Nossas respostas na API vem mastigadas no formato `{ success: boolean, data: any }`. Se atente de usar `response.data.data` ou trate nas chaves desestruturadas (`const { success, data } = response.data`).
2. **Erros**: Em caso de falha (status 400, 404, etc), a resposta será sempre parelha `{ success: false, message: string, code: string }`.
3. Certifique-se de configurar a propriedade `withCredentials: true` nas suas chamadas (Axios ou Fetch) e injetar o access_token sob os *Headers*: `Authorization: Bearer <TOKEN>` no seu AuthInterceptor de request.
