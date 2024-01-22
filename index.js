const API = 'https://api.github.com/users';
let currentPageNum = 1;
let totalRepoCount = 0;

const paginationDiv = document.querySelector('.pagination');
const form = document.getElementById('form');
const initialUI = document.querySelector('.initial');
const loadingUI = document.querySelector('.loading');

const scrollToTop = () => {
  document.documentElement.scrollTop = 0;
};

const showActivePage = () => {
  const pages = document.querySelectorAll('.pagination-item');
  // console.log(pages);
  pages.forEach((page) => {
    if (Number(page.innerHTML) === currentPageNum) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
    // console.log(page);
  });
};

const getUserInfo = async (username) => {
  try {
    const res = await fetch(API + `/${username}`);

    const data = await res.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

const getAllRepos = async (username) => {
  try {
    const res = await fetch(
      API + `/${username}/repos?per_page=10&page=${currentPageNum}`
    );

    const data = await res.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

const showRepos = (repos) => {
  const repoListDiv = document.getElementById('repo-list');
  // console.log(repos)

  repoListDiv.innerHTML = '';

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    const topicList = repo.topics;
    const topicListDiv = document.createElement('ul');
    topicListDiv.className = 'repo-topic-list';

    topicList.map((topic) => {
      const repoItemDiv = document.createElement('li');
      repoItemDiv.innerHTML = topic;
      repoItemDiv.className = 'repo-topic-item';

      topicListDiv.appendChild(repoItemDiv);
    });

    // console.log(topicListDiv);

    const repoDiv = document.createElement('div');
    repoDiv.className = 'repo';

    repoDiv.innerHTML = `
      <h3 class="repo-name">
        <a href="${repo.html_url}" target="_blank">${repo.name} <i class="fa fa-external-link" aria-hidden="true"></i>
        </a>
      </h3>
      <p>${repo.description}</p>
    `;

    repoDiv.appendChild(topicListDiv);

    // console.log(repoDiv);
    repoListDiv.appendChild(repoDiv);
  }
};

const showUser = (user) => {
  const userImgDiv = document.getElementById('user-img-section');
  userImgDiv.innerHTML = '';
  // img
  const userImg = document.createElement('img');
  userImg.className = 'user-img';
  userImg.src = user.avatar_url;

  userImgDiv.appendChild(userImg);

  // name
  const userDescDiv = document.getElementById('user-desc');
  userDescDiv.innerHTML = `
    <h2>${user.name}</h2>
    <p>${user.bio}</p>

    <p><i class="fa fa-map-marker" aria-hidden="true"></i> 
     ${user.location}</p>
    <p><i class="fa fa-twitter" aria-hidden="true"></i>
     <b>Twitter: </b>https://twitter.com/${user.twitter_username}</p>
  `;

  const githubURL = document.getElementById('github-url');
  githubURL.innerHTML = '';
  const url = document.createElement('a');
  url.href = user.html_url;
  url.target = '_blank';
  url.innerHTML =
    '<i class="fa fa-link" aria-hidden="true"></i> ' + user.html_url;
  githubURL.appendChild(url);

  // console.log(githubURL);
};

const setupPagination = async () => {
  const username = document.getElementById('username').value;
  // set up pagination
  const totalPages = Math.ceil(totalRepoCount / 10);
  const paginationList = document.createElement('ul');
  paginationList.className = 'pagination-list';

  // add prev item
  const paginationItemPrev = document.createElement('li');
  paginationItemPrev.className = 'pagination-item';
  paginationItemPrev.addEventListener('click', async () => {
    // console.log('called');
    if (currentPageNum - 1 >= 1) {
      currentPageNum = currentPageNum - 1;
      loadingUI.style.display = 'flex';
      const repos = await getAllRepos(username);
      showRepos(repos);
      scrollToTop();
      showActivePage();
      loadingUI.style.display = 'none';
    }
  });
  paginationItemPrev.innerHTML =
    '<i class="fa fa-angle-double-left" aria-hidden="true"></i> Prev';

  paginationList.appendChild(paginationItemPrev);

  // add the pages count
  for (let i = 1; i <= totalPages; i++) {
    const paginationItem = document.createElement('li');
    paginationItem.className = 'pagination-item';
    paginationItem.innerHTML = i;

    paginationItem.addEventListener('click', async () => {
      // currentPageNum = currentPageNum -1;
      // getAllRepos()
      currentPageNum = i;
      loadingUI.style.display = 'flex';

      const repos = await getAllRepos(username);
      showRepos(repos);
      scrollToTop();
      showActivePage();
      loadingUI.style.display = 'none';
    });

    paginationList.appendChild(paginationItem);
  }

  // add the next item
  const paginationItemNext = document.createElement('li');
  paginationItemNext.className = 'pagination-item';
  paginationItemNext.addEventListener('click', async () => {
    if (currentPageNum + 1 <= totalPages) {
      currentPageNum = currentPageNum + 1;
      loadingUI.style.display = 'flex';
      const repos = await getAllRepos(username);
      showRepos(repos);
      scrollToTop();
      showActivePage();
      loadingUI.style.display = 'none';
    }
  });
  paginationItemNext.innerHTML =
    'Next <i class="fa fa-angle-double-right" aria-hidden="true"></i> ';

  paginationList.appendChild(paginationItemNext);
  paginationDiv.appendChild(paginationList);

  showActivePage();
  // console.log(paginationDiv);
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  initialUI.style.display = 'none';
  loadingUI.style.display = 'flex';
  paginationDiv.innerHTML = '';

  const username = document.getElementById('username').value;

  const userData = await getUserInfo(username);
  const repoData = await getAllRepos(username);

  // console.log(userData);
  // console.log(repoData);

  loadingUI.style.display = 'none';
  paginationDiv.style.display = 'block';

  showUser(userData);
  showRepos(repoData);

  totalRepoCount = userData.public_repos;

  setupPagination();
});
