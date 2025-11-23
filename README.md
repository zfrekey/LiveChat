# LiveChat — Trabalho: Redes de Computadores 2025.2 (UFF)

Desenvolvido por: Filype Abreu e Gabriel Câmara

Projeto desenvolvido como trabalho para a disciplina Redes de Computadores — Prof. Flávio Seixas.

Resumo
- Aplicação de chat em tempo real baseada em WebSockets (Socket.IO) com backend em TypeScript.
- Objetivo: aplicar conhecimentos práticos sobre aplicações de redes, comunicação cliente-servidor, multiplexação de conexões e troca de mensagens em tempo real.

Principais tecnologias
- Node.js 
- TypeScript
- Fastify (servidor HTTP)
- Socket.IO (comunicação em tempo real / WebSocket)

Conceitos e aplicações de redes demonstrados
- Comunicação em tempo real via WebSocket (Socket.IO): conexões persistentes e eventos bidirecionais.
- Modelo cliente-servidor: servidor gerencia salas (rooms) e faz broadcast/emit de eventos.
- Controle de estado por socket (socket.data): armazenar nickname e sala do usuário.
- Mensagens de sistema, broadcast por sala e acknowledgements (ACK) de entrega.
- Indicadores de digitação (typing) para presença e sincronização de estado.
- CORS e considerações sobre segurança de conexões em tempo real.
- Medição do tamanho (em bytes) das mensagens para análise de tráfego.

Estrutura do repositório
- backend/
  - src/
    - server.ts
    - socket.ts        — implementação do Socket.IO e lógica de chat
    - types/  
        - socket.ts    - implementação de tipos     
- frontend/ (opcional)

Como rodar
1. Instalar dependências:
   npm install

2. Iniciar o projeto:
   npm run dev

3. Build e execução em produção:
   npm run build
   npm start
