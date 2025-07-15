// Máscara de telefone (formato brasileiro)
function maskTelefone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/^([1-9]{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    .replace(/(-\d{0,4})\d+?$/, '$1');
}

document.addEventListener('DOMContentLoaded', function () {
  // Partículas de fundo
  criarParticulas();

  const form = document.getElementById('orcamentoForm');
  const btnEnviar = document.getElementById('btnEnviar');
  const agradecimento = document.getElementById('agradecimento');
  const email = document.getElementById('email');
  const camposObrigatorios = form.querySelectorAll('input[required], select[required], textarea[required]');
  const funcionalidadesGroup = document.getElementById('funcionalidades-group');
  const tipoProjeto = document.getElementById('tipoProjeto');
  const faixaPrecoGroup = document.getElementById('faixa-preco-group');
  const faixaPreco = document.getElementById('faixa-preco');
  const tabelaPrecos = {
    'Site Institucional': 'R$ 2.000 – R$ 5.000',
    'Landing Page': 'R$ 1.000 – R$ 3.000',
    'Sistema Web Faculdade': 'R$ 10.000 – R$ 40.000'
  };
  const explicacoesPrecos = {
    'Site Institucional': 'Inclui site institucional moderno, responsivo, com páginas institucionais, formulário de contato e integração básica.',
    'Landing Page': 'Inclui página única de alta conversão, design profissional, formulário e integração com redes sociais.',
    'Sistema Web Faculdade': 'Inclui sistema completo para gestão acadêmica, múltiplos módulos, integrações, segurança e suporte.'
  };

  tipoProjeto.addEventListener('change', function() {
    const valor = tipoProjeto.value;
    if (tabelaPrecos[valor]) {
      faixaPrecoGroup.style.display = '';
      faixaPreco.innerHTML = `<strong>${tabelaPrecos[valor]}</strong><br><span class='explicacao-preco'>${explicacoesPrecos[valor] || ''}</span>`;
    } else {
      faixaPrecoGroup.style.display = 'none';
      faixaPreco.textContent = '';
    }
  });

  // Validação e feedback visual
  camposObrigatorios.forEach(campo => {
    campo.addEventListener('blur', () => validarCampo(campo));
    campo.addEventListener('input', () => validarCampo(campo));
  });

  function validarCampo(campo) {
    let valido = true;
    if (campo.type === 'email') {
      valido = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(campo.value);
    } else if (campo.type === 'checkbox' && campo.name === 'funcionalidades') {
      // handled below
      return true;
    } else {
      valido = campo.value.trim() !== '';
    }
    campo.classList.toggle('valid', valido);
    campo.classList.toggle('invalid', !valido);
    return valido;
  }

  // Validação de grupo de checkboxes (funcionalidades)
  function validarFuncionalidades() {
    const checkboxes = funcionalidadesGroup.querySelectorAll('input[type="checkbox"]');
    const algumMarcado = Array.from(checkboxes).some(cb => cb.checked);
    funcionalidadesGroup.classList.toggle('invalid', !algumMarcado);
    funcionalidadesGroup.classList.toggle('valid', algumMarcado);
    return algumMarcado;
  }

  funcionalidadesGroup.addEventListener('change', validarFuncionalidades);

  // Envio do formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valido = true;
    camposObrigatorios.forEach(campo => {
      if (!validarCampo(campo)) valido = false;
    });
    if (!validarFuncionalidades()) valido = false;
    if (!valido) return;

    // Loading no botão
    btnEnviar.classList.add('loading');
    setTimeout(() => {
      gerarPDF();
      btnEnviar.classList.remove('loading');
      form.classList.add('hidden');
      agradecimento.classList.remove('hidden');
      // Enviar orçamento para WhatsApp do desenvolvedor
      const numeroWhats = '559192891008';
      const msg =
        `Olá! Novo orçamento recebido:%0A` +
        `Nome: ${form.nome.value}%0A` +
        `E-mail: ${form.email.value}%0A` +
        `Faculdade: ${form.faculdade.value}%0A` +
        `Tipo de Projeto: ${form.tipoProjeto.value}%0A` +
        `Prazo: ${(form.prazo ? form.prazo.value : '-') }%0A` +
        `Funcionalidades: ${Array.from(document.querySelectorAll('input[name="funcionalidades"]:checked')).map(cb => cb.value).join(', ')}%0A` +
        `Informações adicionais: ${(form.descricao ? form.descricao.value : '-') }%0A`;
      window.open(`https://wa.me/${numeroWhats}?text=${msg}`, '_blank');
    }, 1200);
  });

  // Geração do PDF
  function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const nome = form.nome.value;
    const data = new Date().toLocaleDateString('pt-BR');
    // Logo
    const logo = document.querySelector('.logo');
    let imgData = '';
    if (logo) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logo.naturalWidth;
        canvas.height = logo.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logo, 0, 0);
        imgData = canvas.toDataURL('image/png');
      } catch (e) {}
    }
    if (imgData) {
      doc.addImage(imgData, 'PNG', 75, 10, 60, 25);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 234, 255);
    doc.text('Pré-Orçamento - Faculdade', 105, 45, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(30, 180, 255);
    doc.text(`Nome:`, 15, 60);
    doc.setTextColor(0,0,0);
    doc.text(form.nome.value, 50, 60);
    doc.setTextColor(30, 180, 255);
    doc.text(`E-mail:`, 15, 70);
    doc.setTextColor(0,0,0);
    doc.text(form.email.value, 50, 70);
    doc.setTextColor(30, 180, 255);
    doc.text(`Faculdade:`, 15, 90);
    doc.setTextColor(0,0,0);
    doc.text(form.faculdade.value, 50, 90);
    doc.setTextColor(30, 180, 255);
    doc.text(`Tipo de Projeto:`, 15, 100);
    doc.setTextColor(0,0,0);
    doc.text(form.tipoProjeto.value, 50, 100);
    doc.setTextColor(30, 180, 255);
    doc.text(`Prazo:`, 15, 110);
    doc.setTextColor(0,0,0);
    doc.text(form.prazo ? form.prazo.value : '-', 50, 110);
    // Removido campo de orçamento/faixa de investimento
    doc.setTextColor(30, 180, 255);
    doc.text(`Faixa de Preço Estimado:`, 15, 130);
    doc.setTextColor(0,0,0);
    doc.text(tabelaPrecos[form.tipoProjeto.value] || '', 70, 130);
    if (explicacoesPrecos[form.tipoProjeto.value]) {
      doc.setFontSize(10);
      doc.setTextColor(80,80,80);
      doc.text(explicacoesPrecos[form.tipoProjeto.value], 15, 137, {maxWidth: 180});
      doc.setFontSize(12);
    }
    doc.setTextColor(30, 180, 255);
    doc.text(`Funcionalidades:`, 15, 140);
    doc.setTextColor(0,0,0);
    const funcionalidadesMarcadas = Array.from(document.querySelectorAll('input[name="funcionalidades"]:checked')).map(cb => cb.value).join(', ');
    doc.text(funcionalidadesMarcadas, 50, 140, {maxWidth: 140});
    doc.setTextColor(30, 180, 255);
    doc.text(`Descrição:`, 15, 150);
    doc.setTextColor(0,0,0);
    doc.text(form.descricao ? form.descricao.value : '-', 15, 158, {maxWidth: 180});
    // Removido campo de observações sobre o orçamento
    // Tabela de referência de preços
    doc.setFontSize(11);
    doc.setTextColor(30, 180, 255);
    doc.text('Tabela de referência de preços (mercado 2024/2025):', 15, 195);
    doc.setTextColor(0,0,0);
    let y = 202;
    Object.entries(tabelaPrecos).forEach(([tipo, preco]) => {
      if(tipo !== 'Outro') {
        doc.text(`${tipo}: ${preco}`, 15, y);
        y += 7;
      }
    });
    doc.setFontSize(9);
    doc.setTextColor(120,120,120);
    doc.text('Valores baseados em pesquisas em plataformas de freelancers e agências especializadas.', 15, y+5, {maxWidth: 180});
    doc.text('O orçamento final será definido após análise detalhada do escopo.', 15, y+10, {maxWidth: 180});
    doc.setFontSize(10);
    doc.setTextColor(120,120,120);
    doc.text(`Gerado em: ${data}`, 15, 285);
    const nomeArquivo = `orcamento_${nome.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase()}_${data.replace(/\//g,'-')}.pdf`;
    doc.save(nomeArquivo);
  }
});

// Efeito de partículas (simples, JS puro)
function criarParticulas() {
  const container = document.querySelector('.background-particles');
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let particulas = [];
  for (let i = 0; i < 60; i++) {
    particulas.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
      alpha: Math.random() * 0.5 + 0.3
    });
  }
  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particulas) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(0,234,255,${p.alpha})`;
      ctx.shadowColor = '#00eaff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // Linhas entre partículas próximas
    for (let i = 0; i < particulas.length; i++) {
      for (let j = i + 1; j < particulas.length; j++) {
        let a = particulas[i], b = particulas[j];
        let dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,234,255,${0.08})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }
  function animar() {
    for (let p of particulas) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    }
    desenhar();
    requestAnimationFrame(animar);
  }
  animar();
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
