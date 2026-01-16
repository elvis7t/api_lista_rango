# Imagem base
FROM node:25-alpine

# Diretório de trabalho
WORKDIR /home/node/app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante da aplicação
COPY . .

# Copia o script de entrada e dá permissão
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expondo a porta da aplicação (ajuste conforme o .env se necessário)
EXPOSE 3000

# Define o script de entrada
ENTRYPOINT ["/entrypoint.sh"]
