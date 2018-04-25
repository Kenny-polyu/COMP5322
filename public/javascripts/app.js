if (account) {

    //Add new user   
    console.log('account:' + account);
	

    socket = io.connect('ws://35.194.192.110:80');

	socket.emit('clients', account);

    //History
    socket.on('history', (obj) => {
        if (obj.length > 0) {
            appendData(obj);
        }
    });

    socket.on('clients', (obj) => {
        document.querySelector('.online').innerHTML = obj.clients;
        if (obj.newClientID !== undefined){
			broadcast(obj.user, "join");
			addNewUser(obj.user, obj.newClientID, obj.time);
		}
		if (obj.removeClientID !== undefined){
			broadcast(obj.user, "leave");
			removeUser(obj.removeClientID);
		}
    });

	socket.on('message', (obj) => {
        appendData([obj]);
    });
	
	socket.on('getName', () => {
        socket.emit('clients', account);
    });
	
}

document.querySelector('#btnAddMsg').addEventListener('click', () => {
    sendData();
});
document.querySelector('.dialogBtnTitle').addEventListener('click', () => {
	if (document.querySelector('.dialog').style.display == '') document.querySelector('.dialog').style.display = 'block';
	else document.querySelector('.dialog').style.display = '';
});
document.querySelector('input').addEventListener('keypress', (e) => {
    if (e.code == 'Enter' || e.code == 'NumpadEnter') {
        sendData();
    }
});

/**
 * Send message
 */
function sendData() {
    let msg = document.querySelector('input').value;
    if (!msg) {
        swal({
            title: "Please say something!",
            icon: "error",
        });
        return;
    }
    let data = {
        name: account,
        msg: msg,
    };
    socket.emit('message', data);
    document.querySelector('input').value = '';
}

/**
 * Scroll to bottom
 */
function scrollWindow() {
    let h = document.querySelector('.speeches');
    h.scrollTo(0, h.scrollHeight);
}

/**
 * chat record
 * @param {message} obj 
 */
function appendData(obj) {
    let el = document.querySelector('.speeches');
    let html = el.innerHTML;

    obj.forEach(element => {

        // other peaple
        //   <div class="speech">
        //     <div class="avatar">
        //       <img src="./images/user.png">
        //     </div>
        //     <div class="content">
        //       <div class="inline author">Yami Odymel</div>
        //       <div class="text">：Hi!!</div>
        //     </div>
        //     <div class=" time"></div>
        //   </div>

        // myself
        //   <div class="speech">
        //     <div class="group">
        //       <div class="avatar">
        //         <img src="./images/user.png">
        //       </div>
        //       <div class="content">
        //         <div class="inline author">Yami Odymel</div>
        //         <div class="text">：Hi!!</div>
        //       </div>
        //     <div class=" time"></div>
        //     </div>
        //   </div>

        html +=
            `
            <div class="${element.name == account ? 'right circular group' : 'circular group'}">
                <div class="speech">
                    ${element.name == account? "<div class='group'>":''}
                        <div class="avatar">
                            <img src="${element.clientID > 0 ? './images/user'+element.clientID+'.png' : './images/user.png'}">
                        </div>
                        <div class="content">
                            <div class="inline author">${element.name == account ? '' : element.name}</div>
                            <div class="text">${element.name == account ? element.msg : '：' + element.msg}</div> 
                        </div>  
                        <div class=" time">${moment(element.time).fromNow()}</div>
                    ${element.name == account? "</div>":''}
                </div>
            </div>
            `;
    });

    el.innerHTML = html.trim();
    scrollWindow();

}

/**
 * broadcast for new user
 * @param {name} obj 
 */
function broadcast(name, action) {

    // <div class="speech">
    //     <div class="broadcast">
    //         <i class="announcement icon"></i>Someone join the chatroom.
    //     </div>
    // </div>

    let el = document.querySelector('.speeches');
    let html = el.innerHTML;

    html +=
        `
        <div class="speech">
            <div class="broadcast">
                <i class="announcement icon"></i>${name} ${action} the chatroom.
            </div>
        </div>
        `;

    el.innerHTML = html.trim();
    scrollWindow();
}

function addNewUser(name, id, time){
	
	let userList = document.querySelector('.userList');
	if (userList.childElementCount > document.querySelector('.online').innerHTML) userList.innerHTML = '';
    let userListHtml = userList.innerHTML;
	//for (i = 0; i < 20; i++){
    userListHtml +=
        `
        <div class="item user" id="user${id}">
			<div class="ts mini image">
				<img src="./images/user${id}.png" title="${name}" alt="${name}">
			</div>
			<div class="content">
				<div class="header">${name}</div>
				<div class="meta">
					<div>${time}</div>
				</div>
			</div>
		</div>
        `;
	//}
    userList.innerHTML = userListHtml.trim();
}
function removeUser(id){
	var user = document.querySelector('#user'+id);
	if (user != null)	user.parentNode.removeChild(user);
}
