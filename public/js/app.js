const state = {
  university: null,
  faculties: [],
  departments: [],
  courses: [],
  lecturers: [],
  news: [],
  events: [],
  researchCenters: [],
  intakes: [],
  admissionsRequirements: [],
};

async function loadJSON(path) {
  const response = await fetch(path);
  return response.json();
}

async function init() {
  await Promise.all([
    loadJSON('/data/university.json').then((data) => (state.university = data)),
    loadJSON('/data/faculties.json').then((data) => (state.faculties = data)),
    loadJSON('/data/departments.json').then((data) => (state.departments = data)),
    loadJSON('/data/courses.json').then((data) => (state.courses = data)),
    loadJSON('/data/lecturers.json').then((data) => (state.lecturers = data)),
    loadJSON('/data/news.json').then((data) => (state.news = data)),
    loadJSON('/data/events.json').then((data) => (state.events = data)),
    loadJSON('/data/research_centers.json').then((data) => (state.researchCenters = data)),
    loadJSON('/data/intakes.json').then((data) => (state.intakes = data)),
    loadJSON('/data/admissions_requirements.json').then((data) => (state.admissionsRequirements = data)),
  ]);

  populateFooter();
  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  if (page === 'academics') renderAcademics();
  if (page === 'admissions') renderAdmissions();
  if (page === 'research') renderResearch();
  if (page === 'news') renderNews();
  if (page === 'course-detail') renderCourseDetail();
  if (page === 'lecturer-detail') renderLecturerDetail();
  if (page === 'news-detail') renderNewsDetail();
  setupNavigation();
}

document.addEventListener('DOMContentLoaded', init);

function setupNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.primary-nav ul');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', (!expanded).toString());
    menu.classList.toggle('open');
  });
}

function populateFooter() {
  if (!state.university) return;
  const addressEl = document.getElementById('footer-address');
  if (addressEl) {
    addressEl.innerHTML = `${state.university.address.street}<br>${state.university.address.city}, ${state.university.address.region}`;
  }
  const socialEl = document.getElementById('footer-social');
  if (socialEl && state.university.socialLinks) {
    socialEl.innerHTML = state.university.socialLinks
      .map((link) => `<li><a href="${link.url}">${link.label}</a></li>`)
      .join('');
  }
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();
}

function renderHome() {
  const statsGrid = document.getElementById('stats-grid');
  const newsList = document.getElementById('news-list');
  const eventsList = document.getElementById('events-list');
  if (statsGrid && state.university) {
    const stats = [
      { label: 'Established', value: state.university.establishedYear },
      { label: 'Students', value: state.university.snapshot.studentCount.toLocaleString() },
      { label: 'Faculties & Schools', value: state.university.snapshot.facultiesCount },
      { label: 'Full-time Staff', value: state.university.snapshot.fullTimeStaff.toLocaleString() },
    ];
    statsGrid.innerHTML = stats
      .map(
        (stat) => `
        <div>
          <dt>${stat.label}</dt>
          <dd>${stat.value}</dd>
        </div>`
      )
      .join('');
  }

  if (newsList) {
    const items = state.news.slice(0, 3);
    newsList.innerHTML = items
      .map(
        (item) => `
        <li>
          <a href="/news/article.html?slug=${item.slug}">${item.title}</a>
          <time datetime="${item.date}">${new Date(item.date).toLocaleDateString()}</time>
        </li>`
      )
      .join('');
  }

  if (eventsList) {
    const items = state.events.slice(0, 3);
    eventsList.innerHTML = items
      .map(
        (event) => `
        <li>
          <strong>${new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong><br>
          ${event.title} &middot; ${event.location}
        </li>`
      )
      .join('');
  }
}

function renderAcademics() {
  const facultySelect = document.getElementById('faculty-select');
  const facultyAccordion = document.getElementById('faculty-accordion');
  if (facultySelect) {
    facultySelect.innerHTML += state.faculties.map((faculty) => `<option value="${faculty.id}">${faculty.name}</option>`).join('');
  }
  if (facultyAccordion) {
    facultyAccordion.innerHTML = state.faculties
      .map((faculty) => {
        const departments = state.departments.filter((dept) => dept.facultyId === faculty.id);
        const sampleCourses = state.courses.filter((course) => course.facultyId === faculty.id).slice(0, 3);
        return `
        <details>
          <summary>${faculty.name}</summary>
          <div class="accordion-body">
            <p>${faculty.description}</p>
            <h3>Departments</h3>
            <ul>
              ${departments
                .map(
                  (dept) => `<li><strong>${dept.name}</strong> — Chair: ${dept.chairName}. ${dept.description}</li>`
                )
                .join('')}
            </ul>
            <h3>Sample Courses</h3>
            <ul>
              ${sampleCourses
                .map((course) => `<li><a href="/course.html?code=${course.courseCode}">${course.title}</a></li>`)
                .join('')}
            </ul>
          </div>
        </details>`;
      })
      .join('');
  }
  setupCourseSearch();
}

function setupCourseSearch() {
  const form = document.getElementById('course-filter-form');
  const results = document.getElementById('course-results');
  if (!form || !results) return;

  const renderResults = (list) => {
    if (list.length === 0) {
      results.innerHTML = '<p>No courses match your filters yet. Try another search.</p>';
      return;
    }
    results.innerHTML = list
      .map(
        (course) => `
        <article>
          <h3><a href="/course.html?code=${course.courseCode}">${course.title}</a></h3>
          <p>${course.shortDescription}</p>
          <p><strong>Level:</strong> ${course.level} · <strong>Credits:</strong> ${course.credits}</p>
        </article>`
      )
      .join('');
  };

  renderResults(state.courses.slice(0, 6));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const facultyId = form.faculty.value;
    const level = form.level.value;
    const query = form.q.value.trim().toLowerCase();
    const filtered = state.courses.filter((course) => {
      const matchesFaculty = facultyId ? course.facultyId === facultyId : true;
      const matchesLevel = level ? course.level === level : true;
      const matchesQuery = query
        ? course.title.toLowerCase().includes(query) || course.courseCode.toLowerCase().includes(query)
        : true;
      return matchesFaculty && matchesLevel && matchesQuery;
    });
    renderResults(filtered.slice(0, 12));
  });
}

function renderAdmissions() {
  const intakeCards = document.getElementById('intake-cards');
  const requirementsGrid = document.getElementById('requirements-grid');
  if (intakeCards) {
    intakeCards.innerHTML = state.intakes
      .map((intake) => {
        const cycles = intake.cycles
          .map(
            (cycle) => `
            <li>
              <strong>${cycle.season}</strong><br>
              Deadline: ${cycle.deadline}<br>
              Application fee: ${cycle.applicationFee}${cycle.decisions ? `<br><span class="cycle-note">Decisions: ${cycle.decisions}</span>` : ''}${cycle.orientation ? `<br><span class="cycle-note">Orientation: ${cycle.orientation}</span>` : ''}
            </li>`
          )
          .join('');
        return `
        <article class="card intake-card">
          <header>
            <span class="badge">${intake.level}</span>
            <h3>${intake.title}</h3>
            <p>${intake.overview}</p>
            <p class="tuition-range">${intake.tuitionRange}</p>
          </header>
          <ul>${cycles}</ul>
          <footer>${intake.supportContact}</footer>
        </article>`;
      })
      .join('');
  }
  if (requirementsGrid) {
    requirementsGrid.innerHTML = state.admissionsRequirements
      .map(
        (req) => `
        <article class="card">
          <span class="badge">${req.level}</span>
          <h3>${req.title}</h3>
          <p><strong>Minimum GPA:</strong> ${req.minimumGPA}</p>
          <ul>
            ${req.requiredDocuments.map((doc) => `<li>${doc}</li>`).join('')}
          </ul>
          <p><strong>English proficiency options:</strong> ${req.englishTests.join(', ')}</p>
          <p><strong>Funding snapshot:</strong> ${req.scholarshipOverview}</p>
          ${req.testingNotes ? `<p>${req.testingNotes}</p>` : ''}
          ${req.additionalNotes ? `<p>${req.additionalNotes}</p>` : ''}
          <footer>${req.supportContact}</footer>
        </article>`
      )
      .join('');
  }
}

function renderResearch() {
  const centerGrid = document.getElementById('center-grid');
  if (!centerGrid) return;
  centerGrid.innerHTML = state.researchCenters
    .map((center) => {
      const lead = state.lecturers.find((lecturer) => lecturer.id === center.leadLecturerId);
      return `
      <article class="card">
        <h3>${center.name}</h3>
        <p>${center.description}</p>
        <p><strong>Center Lead:</strong> ${lead ? lead.fullName : 'TBA'}</p>
        <p><strong>Active Projects:</strong></p>
        <ul>${center.activeProjects.map((project) => `<li>${project}</li>`).join('')}</ul>
        <p><strong>Funding:</strong> ${center.fundingSources.join(', ')}</p>
      </article>`;
    })
    .join('');
}

function renderNews() {
  const newsCards = document.getElementById('news-cards');
  const eventsItems = document.getElementById('events-items');
  if (newsCards) {
    newsCards.innerHTML = state.news
      .map(
        (item) => `
        <article class="card news-card">
          <figure>
            <img src="${item.image}" alt="${item.imageAlt}">
            <span class="category-chip">${item.category}</span>
          </figure>
          <time datetime="${item.date}">${new Date(item.date).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}</time>
          <h3><a href="/news/article.html?slug=${item.slug}">${item.title}</a></h3>
          <p>${item.summary}</p>
          <p class="news-card-meta">By ${item.author} · ${item.readTime}</p>
          <a class="card-link" href="/news/article.html?slug=${item.slug}">Read story</a>
        </article>`
      )
      .join('');
  }
  if (eventsItems) {
    eventsItems.innerHTML = state.events
      .map(
        (event) => `
        <li>
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p>${event.description}</p>
          <p><a href="${event.registrationUrl}">Register</a></p>
        </li>`
      )
      .join('');
  }
}

function renderCourseDetail() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const course = state.courses.find((item) => item.courseCode === code);
  if (!course) return;
  document.getElementById('course-title').textContent = course.title;
  document.getElementById('course-summary').textContent = course.shortDescription;
  document.getElementById('course-code').textContent = course.courseCode;
  document.getElementById('course-credits').textContent = `${course.credits} credits`;
  document.getElementById('course-duration').textContent = `${course.duration} semesters`;
  document.getElementById('course-level').textContent = course.level;
  document.getElementById('course-delivery').textContent = course.deliveryMode;
  document.getElementById('course-tuition').textContent = `$${course.tuitionPerYear.toLocaleString()}`;
  document.getElementById('course-intakes').textContent = course.intakeSeasons.join(', ');
  document.getElementById('course-prerequisites').textContent = course.prerequisites.length
    ? course.prerequisites.join(', ')
    : 'Open to all eligible applicants';
  document.getElementById('course-full').textContent = course.fullDescription;
  document.getElementById('course-curriculum').innerHTML = course.curriculumOutline
    .map((module) => `<li>${module}</li>`)
    .join('');
  const related = state.courses
    .filter((item) => item.departmentId === course.departmentId && item.courseCode !== course.courseCode)
    .slice(0, 4);
  document.getElementById('related-courses').innerHTML = related
    .map((item) => `<li><a href="/course.html?code=${item.courseCode}">${item.title}</a></li>`)
    .join('');
}

function renderLecturerDetail() {
  const params = new URLSearchParams(window.location.search);
  const lecturerId = params.get('id');
  const lecturer = state.lecturers.find((item) => item.id === lecturerId);
  if (!lecturer) return;
  document.getElementById('lecturer-name').textContent = lecturer.fullName;
  document.getElementById('lecturer-title').textContent = lecturer.title;
  document.getElementById('lecturer-photo').src = lecturer.photoPlaceholder;
  document.getElementById('lecturer-photo').alt = `Portrait of ${lecturer.fullName}`;
  document.getElementById('lecturer-contact').innerHTML = `${lecturer.email} · ${lecturer.phone} · ${lecturer.office}`;
  document.getElementById('lecturer-bio').textContent = lecturer.shortBio;
  document.getElementById('lecturer-research').innerHTML = lecturer.researchAreas.map((area) => `<li>${area}</li>`).join('');
  document.getElementById('lecturer-publications').innerHTML = lecturer.publications
    .map((publication) => `<li>${publication}</li>`)
    .join('');
  const teachingCourses = state.courses.filter((course) => course.lecturers?.includes(lecturer.id));
  document.getElementById('lecturer-courses').innerHTML = teachingCourses
    .map((course) => `<li><a href="/course.html?code=${course.courseCode}">${course.title}</a></li>`)
    .join('');
}

function renderNewsDetail() {
  const url = new URL(window.location.href);
  const slug = url.searchParams.get('slug') || window.location.pathname.split('/').pop().replace('.html', '');
  const item = state.news.find((newsItem) => newsItem.slug === slug);
  const articleEl = document.querySelector('[data-news-article]');
  if (!item || !articleEl) {
    const placeholder = document.querySelector('[data-news-missing]');
    if (placeholder) placeholder.hidden = false;
    return;
  }

  document.title = `${item.title} | Brillar Academy`;

  const titleEl = document.querySelector('[data-article-title]');
  if (titleEl) titleEl.textContent = item.title;

  const summaryEl = document.querySelector('[data-article-summary]');
  if (summaryEl) summaryEl.textContent = item.summary;

  const categoryEl = document.querySelector('[data-article-category]');
  if (categoryEl) categoryEl.textContent = item.category;

  const dateEl = document.querySelector('[data-article-date]');
  if (dateEl) {
    dateEl.textContent = new Date(item.date).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    dateEl.setAttribute('datetime', item.date);
  }

  const readTimeEl = document.querySelector('[data-article-readtime]');
  if (readTimeEl) readTimeEl.textContent = item.readTime;

  const authorEl = document.querySelector('[data-article-author]');
  if (authorEl) authorEl.textContent = item.author;

  const imageEl = document.querySelector('[data-article-image]');
  if (imageEl) {
    imageEl.src = item.image;
    imageEl.alt = item.imageAlt;
  }

  const captionEl = document.querySelector('[data-article-caption]');
  if (captionEl) captionEl.textContent = item.imageCaption || '';

  const bodyEl = document.querySelector('[data-article-body]');
  if (bodyEl && Array.isArray(item.body)) {
    bodyEl.innerHTML = item.body.map((paragraph) => `<p>${paragraph}</p>`).join('');
  }

  const quoteEl = document.querySelector('[data-article-quote]');
  if (quoteEl) {
    if (item.pullQuote) {
      quoteEl.textContent = item.pullQuote;
      quoteEl.removeAttribute('hidden');
    } else {
      quoteEl.setAttribute('hidden', 'true');
    }
  }

  const tagsEl = document.querySelector('[data-article-tags]');
  if (tagsEl) {
    if (Array.isArray(item.tags) && item.tags.length > 0) {
      tagsEl.innerHTML = item.tags.map((tag) => `<li>${tag}</li>`).join('');
      tagsEl.removeAttribute('hidden');
    } else {
      tagsEl.setAttribute('hidden', 'true');
    }
  }

  const relatedEl = document.querySelector('[data-article-related]');
  if (relatedEl) {
    if (Array.isArray(item.relatedLinks) && item.relatedLinks.length > 0) {
      relatedEl.parentElement?.removeAttribute('hidden');
      relatedEl.innerHTML = item.relatedLinks
        .map((link) => {
          if (typeof link === 'string') {
            return `<li><a href="${link}">${link.replace('/news/', '').replace('.html', '').replace(/[-_]/g, ' ')}</a></li>`;
          }
          return `<li><a href="${link.url}">${link.label}</a></li>`;
        })
        .join('');
    } else {
      relatedEl.parentElement?.setAttribute('hidden', 'true');
    }
  }
}
