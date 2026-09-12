// Baghban – Main JavaScript

// ── Flash message auto-dismiss ────────────────────────────────
document.querySelectorAll('.flash-success, .flash-error').forEach(el => {
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .5s'; setTimeout(() => el.remove(), 500); }, 4000);
});

// ── Image gallery thumbnails ──────────────────────────────────
document.querySelectorAll('.detail-thumb').forEach(thumb => {
  thumb.addEventListener('click', function () {
    const mainImg = document.getElementById('mainImage');
    if (mainImg) mainImg.src = this.dataset.src;
    document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Star rating input ─────────────────────────────────────────
document.querySelectorAll('.star-input').forEach(container => {
  const inputs = container.querySelectorAll('input[type="radio"]');
  const labels = container.querySelectorAll('label');
  inputs.forEach(input => {
    input.addEventListener('change', function () {
      const selected = parseInt(this.value);
      labels.forEach(label => {
        const val = parseInt(label.getAttribute('for').split('_').pop());
        label.style.color = val <= selected ? '#FFB300' : '#ddd';
      });
    });
  });
  labels.forEach(label => {
    label.addEventListener('mouseenter', function () {
      const hovered = parseInt(this.getAttribute('for').split('_').pop());
      labels.forEach(l => {
        const val = parseInt(l.getAttribute('for').split('_').pop());
        l.style.color = val <= hovered ? '#FFB300' : '#ddd';
      });
    });
    label.addEventListener('mouseleave', function () {
      const checked = container.querySelector('input:checked');
      const selected = checked ? parseInt(checked.value) : 0;
      labels.forEach(l => {
        const val = parseInt(l.getAttribute('for').split('_').pop());
        l.style.color = val <= selected ? '#FFB300' : '#ddd';
      });
    });
  });
});

// ── Quantity controls ─────────────────────────────────────────
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus  = document.getElementById('qtyPlus');
const qtyInput = document.getElementById('qtyInput');
if (qtyMinus && qtyPlus && qtyInput) {
  qtyMinus.addEventListener('click', () => { const v = parseInt(qtyInput.value); if (v > 1) qtyInput.value = v - 1; updateTotal(); });
  qtyPlus.addEventListener('click',  () => { const v = parseInt(qtyInput.value); const max = parseInt(qtyInput.max) || 99; if (v < max) qtyInput.value = v + 1; updateTotal(); });
}
function updateTotal() {
  const price = parseFloat(document.getElementById('plantPrice')?.dataset?.price || 0);
  const qty   = parseInt(qtyInput?.value || 1);
  const totalEl = document.getElementById('totalPrice');
  if (totalEl) totalEl.textContent = 'Rs. ' + (price * qty).toLocaleString();
}

// ── Filter form auto-submit on select change ──────────────────
document.querySelectorAll('.auto-submit').forEach(el => {
  el.addEventListener('change', () => el.closest('form').submit());
});

// ── Care tracker: progress bar ────────────────────────────────
document.querySelectorAll('[data-progress]').forEach(el => {
  const pct = Math.min(100, Math.max(0, parseInt(el.dataset.progress)));
  el.style.width = pct + '%';
  if (pct >= 100) el.style.background = 'linear-gradient(90deg,#E53935,#EF9A9A)';
  else if (pct >= 80) el.style.background = 'linear-gradient(90deg,#FB8C00,#FFCC80)';
});

// ── Navbar scroll effect ──────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  nav.style.boxShadow = window.scrollY > 20 ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.18)';
});

// ── Delete confirm ────────────────────────────────────────────
document.querySelectorAll('.confirm-delete').forEach(form => {
  form.addEventListener('submit', function (e) {
    if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) e.preventDefault();
  });
});

// ── Admin/Seller reject modal ─────────────────────────────────
const rejectForms = document.querySelectorAll('.reject-form');
rejectForms.forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const reason = prompt('Enter rejection reason (required):');
    if (reason && reason.trim()) {
      const hidden = this.querySelector('input[name="reason"]');
      if (hidden) hidden.value = reason.trim();
      this.submit();
    } else if (reason !== null) {
      alert('Rejection reason is required.');
    }
  });
});

// ── Tooltip init ──────────────────────────────────────────────
if (typeof bootstrap !== 'undefined') {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
}
