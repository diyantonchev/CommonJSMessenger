angular.module('chat')
    .factory('notifierService', notifierService);


function notifierService() {

    let service = {
        notificate: notificate,
        notifyMe: notifyMe
    };

    return service;

    function notifyMe(message)
    {
        if(!message){
            message = 'New notification';
        }

        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }
        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification(message);
        }
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification("Hi there!");
                }
            });
        }
        if(notification){
            setTimeout(notification.close.bind(notification), 1000);
        }
    }

    function notificate(title, msg, data) {

        if (!Notification) {
            console.error('Desktop notifications not available');
            return;
        }

        if (Notification.permission !== "granted"){
            Notification.requestPermission();
        }else {
            let notification = new Notification(title, {
                icon: 'http://www.iconsfind.com/wp-content/uploads/2015/12/20151229_56823198660b6.png',
                body: msg,
            });

            notification.onclick = function () {
                let event = new CustomEvent(title, { detail: data });
                document.dispatchEvent(event);
                setTimeout(notification.close.bind(notification), 500);
            };
        }
    }
}