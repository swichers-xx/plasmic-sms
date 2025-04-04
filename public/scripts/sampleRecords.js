const projectId = '65c98e132ca07dd81929f01a';
document.addEventListener('DOMContentLoaded', function () {
  const recordsList = document.getElementById('sampleRecordsList');
  const paginationContainer = document.getElementById('paginationContainer');
  let currentPage = 1;

  async function fetchSampleRecords(page = 1, searchTermPhone = '', searchTermName = '') {
    recordsList.innerHTML = '';
    try {
      const response = await fetch(`/api/projects/${projectId}/sample?page=${page}&phone=${searchTermPhone}&name=${searchTermName}`);
      const { samples, totalPages } = await response.json();
      samples.forEach(sample => {
        const recordItem = document.createElement('p');
        recordItem.textContent = `Name: ${sample.name}, Phone: ${sample.phone}, SurveyLink: ${sample.surveyLink}`;
        recordsList.appendChild(recordItem);
      });
      updatePagination(totalPages, page);
    } catch (error) {
      console.error('Failed to fetch sample records:', error);
      recordsList.innerHTML = '<p>Error fetching sample records.</p>';
    }
  }

  function updatePagination(totalPages, currentPage) {
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('li');
      pageItem.className = 'page-item' + (i === currentPage ? ' active' : '');
      const pageLink = document.createElement('a');
      pageLink.className = 'page-link';
      pageLink.href = '#';
      pageLink.textContent = i;
      pageLink.addEventListener('click', () => fetchSampleRecords(i));
      pageItem.appendChild(pageLink);
      paginationContainer.appendChild(pageItem);
    }
  }

  document.getElementById('searchSampleForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const searchTermPhone = document.getElementById('searchTermPhone').value;
    const searchTermName = document.getElementById('searchTermName').value;
    fetchSampleRecords(1, searchTermPhone, searchTermName);
  });

  fetchSampleRecords();
});