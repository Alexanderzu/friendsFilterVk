import renderFriendsFn from './templates/friends.hbs';
import './style.scss';

let leftListArray = [];
let rightListArray = [];


VK.init({
  apiId: 6771075
});

function auth() {
  return new Promise((resolve, reject) => {
    VK.Auth.login(data => {
      if (data.session) {
        resolve();
      } else {
        reject(new Error('Error!') )
      }
    }, 2);
  });
}

function callAPI(method, params) {
  params.v = '5.76';
  return new Promise((resolve, reject) => {
    VK.api(method, params, (data) => {
      if(data.error) {
        reject(data.error);
      } else {
        resolve(data.response);
      }
    });
  })
}

(async () => {
  try {
    await auth();
    const [me] = await callAPI('users.get', {name_case: 'gen'});
    const headerInfo = document.querySelector("#nameUser");
    headerInfo.textContent = `Выберите друзей ${me.first_name} ${me.last_name}`;
    
    const friends = await callAPI('friends.get', { fields: 'first_name, last_name, photo_50' });
    const leftListHTML = renderFriendsFn({ friends: friends.items });
    results.innerHTML = leftListHTML;
    leftListArray = friends.items;

    results.addEventListener('click', function(e) {
      if (!e.target.classList.contains("friend__add")) return;
      const id = Number(e.target.getAttribute('data-id'));
      const leftArrayIndex = leftListArray.findIndex(friend => friend.id === id);
      rightListArray.push(leftListArray[leftArrayIndex]);
      leftListArray.splice(leftArrayIndex, 1);
      const html = renderFriendsFn({ friends: leftListArray });
      results.innerHTML = html;
    });

  } catch (e) {
    console.error(e);
  }
})();



const isMatching = (full, chunk) => {
  return full.toLowerCase().indexOf(chunk.toLowerCase()) > -1;
};

const filterInputVK = document.querySelector("#filterInputVK");
const filterInputMy = document.querySelector("#filterInputMy");

filterInputVK.addEventListener('keyup', function() {
  // это обработчик нажатия кливиш в текстовом поле
  const value = filterInputVK.value;
  if (!value) {
    renderFriendsFn(leftListArray);
    return;
  } 
  const filteredFriends = leftListArray.filter(friend => 
    isMatching(`${friend.first_name} ${friend.last_name}`, value)
  );
  const html = renderFriendsFn({ friends: filteredFriends });
  results.innerHTML = html;

});

// D&D
const results = document.querySelector(".friends");
const resultsNew = document.querySelector(".friends-new");

makeDnD([results, resultsNew]);

function makeDnD(zones) {
  let currentDrag;

  zones.forEach(zone => {
      zone.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/html', 'dragstart');
          currentDrag = { results: zone, node: e.target };
      });

      zone.addEventListener('dragover', (e) => {
          e.preventDefault(); 
      });

      zone.addEventListener('drop', (e) => {
          if (currentDrag) {
              e.preventDefault();
              

              if (currentDrag.results !== zone) {
                  if (e.target.classList.contains('friend')) {
                      zone.insertBefore(currentDrag.node, e.target.nextElementSibling);
                      
                  } else {
                      zone.insertBefore(currentDrag.node, zone.lastElementChild);
                  }
              }
              currentDrag = null;
          }
      });
  })
}