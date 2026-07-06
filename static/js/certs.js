// ===================================================================
// Certificates page logic: public gallery + password-protected
// admin upload panel, backed by Supabase (Postgres + Storage + Auth).
// ===================================================================

const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = "certificates";
const TABLE = "certificates";

const galleryEl = document.getElementById("certs-gallery");
const emptyEl = document.getElementById("certs-empty");
const adminToggleBtn = document.getElementById("certs-admin-toggle");
const adminPanel = document.getElementById("certs-admin-panel");
const loginForm = document.getElementById("certs-login-form");
const loginError = document.getElementById("certs-login-error");
const uploadSection = document.getElementById("certs-upload-section");
const uploadForm = document.getElementById("certs-upload-form");
const uploadStatus = document.getElementById("certs-upload-status");
const logoutBtn = document.getElementById("certs-logout-btn");

let isAdmin = false;

// ---------- Gallery rendering ----------

function renderGallery(certs) {
  galleryEl.innerHTML = "";

  if (!certs || certs.length === 0) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  certs.forEach((cert) => {
    const card = document.createElement("div");
    card.className = "cert-card";

    const dateText = cert.date_issued
      ? new Date(cert.date_issued).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        })
      : "";

    card.innerHTML = `
      <a class="cert-card__image-link" href="${cert.image_url}" target="_blank" rel="noopener">
        <img class="cert-card__image" src="${cert.image_url}" alt="${escapeHTML(cert.title)}" loading="lazy">
      </a>
      <div class="cert-card__body">
        <h4 class="cert-card__title">${escapeHTML(cert.title)}</h4>
        ${cert.issuer ? `<p class="cert-card__issuer">${escapeHTML(cert.issuer)}</p>` : ""}
        ${dateText ? `<p class="cert-card__date">${dateText}</p>` : ""}
        ${cert.description ? `<p class="cert-card__desc">${escapeHTML(cert.description)}</p>` : ""}
      </div>
      ${isAdmin ? `<button class="cert-card__delete" data-id="${cert.id}" data-path="${cert.storage_path}" aria-label="Delete certificate">Delete</button>` : ""}
    `;

    galleryEl.appendChild(card);
  });

  if (isAdmin) {
    galleryEl.querySelectorAll(".cert-card__delete").forEach((btn) => {
      btn.addEventListener("click", handleDelete);
    });
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

async function loadCerts() {
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("date_issued", { ascending: false });

  if (error) {
    console.error("Error loading certificates:", error);
    emptyEl.hidden = false;
    emptyEl.textContent = "Couldn't load certificates right now.";
    return;
  }

  renderGallery(data);
}

// ---------- Admin: show/hide panel ----------

adminToggleBtn.addEventListener("click", () => {
  adminPanel.hidden = !adminPanel.hidden;
});

// ---------- Admin: login ----------

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;

  const email = document.getElementById("certs-email").value.trim();
  const password = document.getElementById("certs-password").value;

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = "Login failed: " + error.message;
    loginError.hidden = false;
    return;
  }

  await enterAdminMode();
});

async function enterAdminMode() {
  isAdmin = true;
  loginForm.hidden = true;
  uploadSection.hidden = false;
  logoutBtn.hidden = false;
  loadCerts(); // re-render with delete buttons
}

logoutBtn.addEventListener("click", async () => {
  await client.auth.signOut();
  isAdmin = false;
  loginForm.hidden = false;
  uploadSection.hidden = true;
  logoutBtn.hidden = true;
  document.getElementById("certs-email").value = "";
  document.getElementById("certs-password").value = "";
  loadCerts();
});

// ---------- Admin: upload ----------

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  uploadStatus.hidden = false;
  uploadStatus.textContent = "Uploading...";

  const title = document.getElementById("cert-title").value.trim();
  const issuer = document.getElementById("cert-issuer").value.trim();
  const dateIssued = document.getElementById("cert-date").value || null;
  const description = document.getElementById("cert-description").value.trim();
  const fileInput = document.getElementById("cert-file");
  const file = fileInput.files[0];

  if (!title || !file) {
    uploadStatus.textContent = "Title and image are required.";
    return;
  }

  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    const { error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = client.storage.from(BUCKET).getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;

    const { error: insertError } = await client.from(TABLE).insert({
      title,
      issuer,
      date_issued: dateIssued,
      description,
      image_url: imageUrl,
      storage_path: filePath,
    });

    if (insertError) throw insertError;

    uploadStatus.textContent = "Uploaded!";
    uploadForm.reset();
    loadCerts();
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "Upload failed: " + err.message;
  }
});

// ---------- Admin: delete ----------

async function handleDelete(e) {
  const id = e.currentTarget.dataset.id;
  const path = e.currentTarget.dataset.path;

  if (!confirm("Delete this certificate?")) return;

  const { error: dbError } = await client.from(TABLE).delete().eq("id", id);
  if (dbError) {
    alert("Couldn't delete record: " + dbError.message);
    return;
  }

  if (path) {
    await client.storage.from(BUCKET).remove([path]);
  }

  loadCerts();
}

// ---------- Init ----------

(async function init() {
  const { data: { session } } = await client.auth.getSession();
  if (session) {
    await enterAdminMode();
  } else {
    loadCerts();
  }
})();
