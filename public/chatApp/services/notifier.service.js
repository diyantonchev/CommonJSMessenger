angular.module('chat')
    .factory('notifierService', notifierService);


function notifierService() {

    let service = {
        notifyMe: notifyMe
    };

    return service;

    function notifyMe(title, msg, data) {

        if (!Notification) {
            alert('Desktop notifications not available');
            return;
        }

        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {
            let notification = new Notification(title, {
                icon: 'http://www.iconsfind.com/wp-content/uploads/2015/12/20151229_56823198660b6.png',
                body: msg,
            });

            notification.onclick = function () {
                let event = new CustomEvent('New Message', { detail: data })
                document.dispatchEvent(event);
                setTimeout(notification.close.bind(notification), 500);
            };
        }
    }
}