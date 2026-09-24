// Catálogo para exibição do Front-End (Sem responsabilidade de cobrança)
const produtos = [
    {
        id: 1,
        titulo: "NETFLIX 1 MÊS",
        precoOriginal: "R$ 44,90",
        desconto: "-10% OFF",
        precoPix: "R$ 15,00",
        imagem: "assets/produto1.webp"
    },
    {
        id: 2,
        titulo: "INTERNET VPN 1 MÊS",
        precoOriginal: "R$ 35,00",
        desconto: "-20% OFF",
        precoPix: "R$ 10,00",
        imagem: "assets/produto2.svg"
    },
    {
        id: 3,
        titulo: "Produto Digital Exemplo 3",
        precoOriginal: "R$ 49,90",
        desconto: "-15% OFF",
        precoPix: "R$ 42,41",
        imagem: "assets/produto3.svg"
    },
    {
        id: 4,
        titulo: "Produto Digital Exemplo 4",
        precoOriginal: "R$ 199,90",
        desconto: "-30% OFF",
        precoPix: "R$ 139,93",
        imagem: "assets/produto4.svg"
    },
    {
        id: 5,
        titulo: "Produto Digital Exemplo 5",
        precoOriginal: "R$ 29,90",
        desconto: "-5% OFF",
        precoPix: "R$ 28,40",
        imagem: "assets/produto5.svg"
    }
];

let produtoSelecionado = null;
let quantidadeCarrinho = 0;

function atualizarContadorCarrinho() {
    const contador = document.getElementById('cart-total');
    if (contador) contador.textContent = quantidadeCarrinho;
}

// Renderização dos cards no catálogo
function carregarProdutos() {
    const container = document.getElementById('produtos-container');
    if (!container) return;
    container.innerHTML = ""; 
    
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        
        card.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.titulo}" loading="lazy">
            <div class="card-body">
                <h3>${produto.titulo}</h3>
                <div>
                    <span class="price-original">${produto.precoOriginal}</span>
                    <span class="discount-badge">${produto.desconto}</span>
                </div>
                <div class="price-final">${produto.precoPix}</div>
                <button type="button" class="buy-btn" onclick="abrirCheckout(${produto.id})">Comprar agora</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Controladores do Carrossel (Drag & Scroll)
const wrapper = document.querySelector('.carrossel-wrapper');
let isDown = false;
let startX, scrollLeft;

if (wrapper) {
    wrapper.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDown = true;
        wrapper.classList.add('arrastando');
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener('mouseleave', () => {
        isDown = false;
        wrapper.classList.remove('arrastando');
    });

    wrapper.addEventListener('mouseup', () => {
        isDown = false;
        wrapper.classList.remove('arrastando');
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return; 
        e.preventDefault();
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 2;
        wrapper.scrollLeft = scrollLeft - walk;
    });
}

// Inicialização e Máscara de CPF
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();

    const ofertaDestaque = document.getElementById('oferta-destaque');
    if (ofertaDestaque) {
        const mostrarOfertaNoCatalogo = () => {
            document.getElementById('produtos-container')?.firstElementChild?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        };

        ofertaDestaque.addEventListener('click', mostrarOfertaNoCatalogo);
        ofertaDestaque.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                mostrarOfertaNoCatalogo();
            }
        });
    }

    const checkoutModal = document.getElementById('checkout-modal');
    document.getElementById('btn-fechar-checkout')?.addEventListener('click', fecharCheckout);
    checkoutModal?.addEventListener('click', (event) => {
        if (event.target === checkoutModal) fecharCheckout();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && checkoutModal?.style.display === 'flex') {
            fecharCheckout();
        }
    });

    const cpfInput = document.getElementById('client-cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v;
        });
    }
});

function abrirCheckout(id) {
    produtoSelecionado = produtos.find(p => p.id === id);
    if (!produtoSelecionado) return;

    quantidadeCarrinho += 1;
    atualizarContadorCarrinho();

    document.getElementById('modal-product-name').innerText = produtoSelecionado.titulo;
    document.getElementById('modal-product-price').innerText = produtoSelecionado.precoPix;
    
    document.getElementById('checkout-step-1').style.display = 'block';
    document.getElementById('checkout-step-2').style.display = 'none';
    document.getElementById('checkout-modal').style.display = 'flex';
}

function fecharCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

// Processamento do Pagamento enviando APENAS o produto_id
async function processarPagamento(event) {
    event.preventDefault();

    const cpfLimpo = document.getElementById('client-cpf').value.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        alert('Por favor, digite um CPF válido com 11 dígitos.');
        return;
    }

    const btnSubmit = document.getElementById('btn-submit-pay');
    btnSubmit.innerText = "Gerando Pix...";
    btnSubmit.disabled = true;

    // ENVIAR APENAS O ID DO PRODUTO (NUNCA O PREÇO)
    const dadosCliente = {
        produto_id: produtoSelecionado.id,
        nome: document.getElementById('client-name').value.trim(),
        email: document.getElementById('client-email').value.trim(),
        cpf: cpfLimpo
    };

    try {
        const response = await fetch('gerar-pix.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCliente)
        });

        const resultado = await response.json();

        if (response.ok && resultado.success) {
            document.getElementById('pix-qr-image').src = `data:image/png;base64,${resultado.qr_code_base64}`;
            document.getElementById('pix-copia-cola').value = resultado.qr_code;
            
            document.getElementById('checkout-step-1').style.display = 'none';
            document.getElementById('checkout-step-2').style.display = 'block';
        } else {
            alert('Erro ao gerar Pix: ' + (resultado.message || 'Verifique os dados informados.'));
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Ocorreu um erro ao conectar com o servidor de pagamento. Tente novamente.');
    } finally {
        btnSubmit.innerText = "Gerar QR Code Pix";
        btnSubmit.disabled = false;
    }
}

function copiarPix() {
    const inputPix = document.getElementById('pix-copia-cola');
    inputPix.select();
    navigator.clipboard.writeText(inputPix.value);
    alert('Código Pix copiado para a área de transferência!');
}