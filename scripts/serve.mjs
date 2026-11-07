// Servidor estático local para web/ (sem dependências). Uso: npm run dev  ->  http://localhost:8000
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('../web', import.meta.url)));
const PORTA = Number(process.env.PORT) || 8000;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const servidor = createServer(async (req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let arquivo = normalize(join(RAIZ, caminho));
  if (arquivo !== RAIZ && !arquivo.startsWith(RAIZ + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, 'index.html');
    const corpo = await readFile(arquivo);
    res.writeHead(200, {'Content-Type': TIPOS[extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    res.end(corpo);
  } catch {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}).end('Não encontrado: ' + caminho);
  }
  console.log(res.statusCode, req.method, caminho);
});

servidor.on('error', e => {
  console.error(e.code === 'EADDRINUSE' ? `Porta ${PORTA} ocupada. Feche o outro servidor ou use PORT=8001 npm run dev.` : e.message);
  process.exit(1);
});

servidor.listen(PORTA, '127.0.0.1', () => console.log(`JARVIS local em http://localhost:${PORTA}  (Ctrl+C para parar)`));
