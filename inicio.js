
// Menu  GÊNERO
const genreToggle = document.getElementById('genreToggle');
const genreMenu = document.getElementById('genreMenu');

if(genreToggle && genreMenu){
  genreToggle.addEventListener('click', e=>{
    e.preventDefault();
    const isOpen = genreMenu.style.display==='block';
    genreMenu.style.display = isOpen ? 'none' : 'block';
    genreToggle.setAttribute('aria-expanded', !isOpen);
    genreMenu.setAttribute('aria-hidden', isOpen);
  });

  document.addEventListener('click', e=>{
    if(!genreMenu.contains(e.target) && !genreToggle.contains(e.target)){
      genreMenu.style.display='none';
      genreToggle.setAttribute('aria-expanded', false);
      genreMenu.setAttribute('aria-hidden', true);
    }
  });
}

// Carrinho sem duplicação + zerar ao carregar a pagina

const STORAGE_CART_KEY = 'rw_cart_v1';
function readCart(){ return JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]'); }
function writeCart(c){ localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(c)); refreshCartCount(); }
function refreshCartCount(){ document.getElementById('cartCount').innerText = readCart().length; }

// zerar carrinho ao carregar
writeCart([]);

document.querySelectorAll('.btn-add').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const card = btn.closest('.product-card');
    const title = card?.dataset.title;
    if(!title) return;

    let cart = readCart();
    if(cart.some(p=>p.title===title)){
      showToast(`${title} já está no carrinho!`);
      return;
    }

    const priceText = parseFloat((card.querySelector('.price')?.innerText||'0').replace(/[^\d,]/g,'').replace(',','.')) || 0;
    cart.push({title, price: priceText, id: Date.now()});
    writeCart(cart);
    btn.textContent = 'Adicionado ✓';
    btn.disabled = true;
    showToast(`${title} adicionado ao carrinho`);
    setTimeout(()=>{ btn.textContent='Adicionar ao carrinho'; btn.disabled=false; },1200);
  });
});


// Favoritos

const STORAGE_FAV_KEY = 'rw_favs_v1';
function readFavs(){ return JSON.parse(localStorage.getItem(STORAGE_FAV_KEY)||'[]'); }
function writeFavs(f){ localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(f)); }

document.querySelectorAll('.btn-fav').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const card = btn.closest('.product-card');
    if(!card) return;
    const title = card.dataset.title || card.querySelector('h3')?.innerText || 'Produto';
    let favs = readFavs();

    if(!favs.includes(title)){
      favs.push(title);
      writeFavs(favs);
      btn.style.color = 'crimson'; 
      showToast(`${title} adicionado aos favoritos`);
    } else {
      showToast(`${title} já está adicionado nos favoritos`);
    }
  });
});


// Pesquisa

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const productGrid = document.getElementById('productGrid');
const scopeSelect = document.getElementById('search-scope');

function normalize(s){ return String(s||'').toLowerCase().trim(); }

function updateSearch(){
  const term = normalize(searchInput.value);
  const scope = scopeSelect.value;
  const cards = Array.from(productGrid.querySelectorAll('.product-card'));
  let found = false;

  cards.forEach(card=>{
    const title = normalize(card.dataset.title);
    const type = card.dataset.type;
    const matchScope = (scope==='all') || (scope===type);
    const matchText = (term==='') || title.includes(term);
    if(matchScope && matchText){ card.style.display=''; found=true; }
    else { card.style.display='none'; }
  });

  const msg = document.getElementById('noResultsMsg');
  if(!found){
    if(!msg){
      const div = document.createElement('div');
      div.id='noResultsMsg';
      div.style.gridColumn='1/-1';
      div.style.textAlign='center';
      div.style.padding='20px';
      div.style.color='#737a6c';
      div.style.fontSize='16px';
      div.innerText='Nenhum produto encontrado.';
      productGrid.appendChild(div);
    }
  } else if(msg){ msg.remove(); }
}

searchBtn.addEventListener('click', updateSearch);
searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter') updateSearch(); });


// Toast (mensagem)

function showToast(msg){
  const t = document.createElement('div');
  t.className='rw-toast';
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;
    right:18px;
    bottom:18px;
    background:var(--verde-1);
    color:#072018;
    padding:12px 18px;
    border-radius:10px;
    z-index:9999;
    box-shadow:0 8px 24px rgba(0,0,0,0.2);
    opacity:0;
    font-weight:600;
    transition: opacity 0.5s, transform 0.3s;
    transform: translateY(20px);
  `;
  document.body.appendChild(t);
  // mostrar
  setTimeout(()=>{ t.style.opacity='1'; t.style.transform='translateY(0)'; },50);
  // sumir
  setTimeout(()=>{
    t.style.opacity='0';
    t.style.transform='translateY(20px)';
  },2200);
  setTimeout(()=> t.remove(),2600);
}
