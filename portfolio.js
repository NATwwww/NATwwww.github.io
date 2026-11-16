(() => {
  const profile = window.PORTFOLIO;
  const $ = selector => document.querySelector(selector);
  $('#profile-name').textContent = profile.name;
  $('#english-name').textContent = profile.englishName;
  $('#profile-role').textContent = profile.role;
  $('#introduction').textContent = profile.introduction;
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  if (profile.contacts) {
    const contacts = $('#introduction');
    contacts.replaceChildren();
    contacts.classList.add('contact-list');
    profile.contacts.forEach(contact => {
      const link = make('a', 'contact-link');
      link.href = contact.href;
      link.append(make('span', 'contact-label', contact.label), make('span', '', contact.text));
      contacts.append(link);
    });
  }
  profile.tags.forEach(tag => $('#profile-tags').append(make('span', '', tag)));
  const dialog = $('#detail-dialog');
  let opener;
  function openDetail(section, trigger) {
    opener = trigger;
    $('#detail-eyebrow').textContent = `${section.number} / ${section.english}`;
    $('#detail-title').textContent = section.title;
    $('#detail-subtitle').textContent = section.subtitle;
    const body = $('#detail-body');
    body.replaceChildren();
    section.entries.forEach(entry => {
      const article = make('article', 'detail-entry');
      article.append(make('p', 'entry-label', entry.label), make('h3', '', entry.title));
      if (entry.meta) article.append(make('p', 'entry-meta', entry.meta));
      if (entry.text) article.append(make('p', 'entry-text', entry.text));
      if (entry.bullets) {
        const list = make('ul');
        entry.bullets.forEach(text => {
          const item = make('li');
          const colon = text.indexOf('：');
          if (colon > 0 && colon < 12) {
            item.append(make('strong', '', text.slice(0, colon + 1)), document.createTextNode(text.slice(colon + 1)));
          } else item.textContent = text;
          list.append(item);
        });
        article.append(list);
      }
      if (section.id === 'skills' && entry.tags?.length) {
        article.append(make('p', 'skill-keywords', entry.tags.join(' · ')));
      }
      if (entry.tools) article.append(make('p', 'entry-tools', `工具：${entry.tools}`));
      if (entry.evidence) article.append(make('p', 'entry-evidence', `实践：${entry.evidence}`));
      if (entry.result) {
        const result = make('div', 'entry-result');
        result.append(make('span', 'result-label', '结果 / RESULTS'), make('p', '', entry.result));
        article.append(result);
      }
      if (entry.links) {
        const links = make('div', 'entry-links');
        entry.links.forEach(item => {
          const link = make('a', 'project-link', `${item.label} ↗`);
          link.href = item.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', `${item.label}（在新标签页打开）`);
          links.append(link);
        });
        article.append(links);
      }
      body.append(article);
    });
    dialog.showModal();
    document.body.classList.add('modal-open');
    $('.dialog-scroll').scrollTop = 0;
  }
  profile.sections.forEach(section => {
    const button = make('button', 'ticket');
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'detail-dialog');
    button.setAttribute('aria-label', `查看${section.title}`);
    const top = make('div', 'ticket-top');
    top.append(make('span', 'ticket-number', section.number), make('span', 'ticket-arrow', '↗'));
    button.append(top, make('h2', '', section.title), make('p', 'ticket-english', section.english), make('p', 'ticket-summary', section.summary));
    const foot = make('div', 'ticket-foot');
    const barcode = make('span', 'barcode'); barcode.setAttribute('aria-hidden', 'true');
    foot.append(make('span', '', 'EXPLORE MORE'), barcode);
    button.append(foot);
    button.addEventListener('click', () => openDetail(section, button));
    $('#section-cards').append(button);
  });
  $('#close-dialog').addEventListener('click', () => dialog.close());
  let backdropDown = false;
  dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && backdropDown) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    opener?.focus({ preventScroll: true });
  });
  const resume = $('#resume-link');
  if (profile.resumeUrl) {
    resume.href = profile.resumeUrl;
    resume.setAttribute('download', '');
    $('#resume-note').textContent = 'PDF 简历 · 点击下载';
  } else {
    resume.setAttribute('aria-disabled', 'true');
    resume.addEventListener('click', event => {
      event.preventDefault();
      $('#resume-note').textContent = '简历即将上线，欢迎先探索下方四张卡片。';
    });
  }
})();
