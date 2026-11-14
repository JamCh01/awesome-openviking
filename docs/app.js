const grid = document.querySelector('#project-grid');
const search = document.querySelector('#search');
const emptyState = document.querySelector('#empty-state');
const languageButton = document.querySelector('#language');
let projects = [];
let activeFilter = 'all';
let language = localStorage.getItem('awesome-ov-language') || 'en';

const copy = {
  en: {
    eyebrow: 'THE OPENVIKING ECOSYSTEM', title: 'Good context<br>goes <em>further.</em>',
    description: 'A living atlas of projects, integrations, and ideas that help agents remember, retrieve, and build.',
    explore: 'Explore the atlas', submit: 'Add your project', projects: 'PROJECTS', layers: 'LAYERS OF CONTEXT', possibilities: 'POSSIBILITIES',
    atlas: 'ATLAS', find: 'Find your next building block.', curation: 'Handpicked projects from the OpenViking community and partners.',
    all: 'All projects', community: 'Community', partners: 'Partners', searchLabel: 'Search projects',
    contributeLabel: 'CONTRIBUTE', built: 'Built something<br>with OpenViking?',
    invite: 'A plugin, a tool, a field guide, or an experiment that worked. Add it to the map and help the next builder find their way.',
    pr: 'Make a pull request', footer: 'Context is the new frontier.', curated: 'Curated by the community',
    communityBadge: 'Community project', partnerBadge: 'Partner project', view: 'View project', noResults: 'No projects found. Try another search.'
  },
  zh: {
    eyebrow: 'OPENVIKING 生态地图', title: '好上下文，<br>让智能体<em>走得更远。</em>',
    description: '收录 OpenViking 生态里的项目、集成与灵感，让智能体记得住、找得到、做得成。',
    explore: '探索生态地图', submit: '提交你的项目', projects: '收录项目', layers: '上下文的三个层次', possibilities: '种可能',
    atlas: '生态地图', find: '找到下一块拼图。', curation: '精选 OpenViking 社区项目与合作伙伴。',
    all: '全部项目', community: '社区项目', partners: '合作项目', searchLabel: '搜索项目',
    contributeLabel: '一起共建', built: '用 OpenViking<br>做了点东西？',
    invite: '插件、工具、实践指南，或一次走通的实验，都值得放上图谱。让下一位开发者少走弯路。',
    pr: '提交 Pull Request', footer: '上下文，新边疆。', curated: '由 OpenViking 社区整理',
    communityBadge: '社区项目', partnerBadge: '合作项目', view: '查看项目', noResults: '没有找到相关项目，换个关键词试试。'
  }
};

function setLanguage(next) {
  language = next;
  localStorage.setItem('awesome-ov-language', language);
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = copy[language][element.dataset.i18n];
    if (value !== undefined) element.innerHTML = value;
  });
  languageButton.textContent = language === 'en' ? '中文' : 'EN';
  languageButton.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
  search.placeholder = language === 'en' ? 'Search the atlas…' : '搜索生态项目…';
  emptyState.textContent = copy[language].noResults;
  render();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function projectCard(project, index) {
  const description = language === 'zh' ? project.descriptionZh : project.description;
  const badge = project.category === 'community' ? copy[language].communityBadge : copy[language].partnerBadge;
  return `<article class="project-card" style="animation-delay:${Math.min(index * 45, 270)}ms">
    <a class="project-image" href="${escapeHtml(project.url)}" target="_blank" rel="noreferrer" tabindex="-1">
      <img src="${escapeHtml(project.image)}" alt="" loading="lazy" width="600" height="300">
      <span class="project-type">${badge}</span>
    </a>
    <div class="project-body">
      <a class="project-title" href="${escapeHtml(project.url)}" target="_blank" rel="noreferrer"><h3>${escapeHtml(project.name)}</h3><span aria-hidden="true">↗</span></a>
      <p class="project-description">${escapeHtml(description)}</p>
      <div class="project-tags">${project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="project-footer"><span>by ${escapeHtml(project.maintainer)}</span><a href="${escapeHtml(project.url)}" target="_blank" rel="noreferrer">${copy[language].view} ↗</a></div>
    </div>
  </article>`;
}

function render() {
  if (!projects.length) return;
  const query = search.value.trim().toLocaleLowerCase();
  const filtered = projects.filter((project) => {
    const categoryMatches = activeFilter === 'all' || project.category === activeFilter;
    const haystack = `${project.name} ${project.description} ${project.descriptionZh} ${project.tags.join(' ')} ${project.maintainer}`.toLocaleLowerCase();
    return categoryMatches && haystack.includes(query);
  });
  grid.innerHTML = filtered.map(projectCard).join('');
  emptyState.hidden = filtered.length > 0;
}

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    render();
  });
});

search.addEventListener('input', render);
languageButton.addEventListener('click', () => setLanguage(language === 'en' ? 'zh' : 'en'));
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
  if (event.key === 'Escape' && document.activeElement === search) {
    search.value = '';
    search.blur();
    render();
  }
});

async function init() {
  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) throw new Error(`Unable to load projects: ${response.status}`);
    const data = await response.json();
    projects = data.projects;
    document.querySelector('#project-count').textContent = String(projects.length).padStart(2, '0');
    document.querySelector('#all-count').textContent = projects.length;
    document.querySelector('#community-count').textContent = projects.filter((p) => p.category === 'community').length;
    document.querySelector('#partner-count').textContent = projects.filter((p) => p.category === 'partner').length;
    setLanguage(language);
  } catch (error) {
    grid.innerHTML = '<p class="empty-state">The atlas could not load. <a href="https://github.com/openviking-superagent/awesome-openviking#readme">View the list on GitHub ↗</a></p>';
    console.error(error);
  }
}

document.querySelector('#year').textContent = new Date().getFullYear();
init();
