require('./removeByValue')();

module.exports = function(io){
    var userList = []; // 사용자 리스트를 저장할 배열
    io.on('connection', function(socket){
        // 아래 두줄로 passport의 req.user의 데이터에 접근한다.
        var session = socket.request.session.passport;
        var user = (typeof session !== 'undefined') ? (session.user) : "";

        // indexOf : 일치하는 게 없으면 -1 return
        // userList 필드에 사용자 명이 존재 하지 않으면 삽입
        if(userList.indexOf(user.displayname) === -1){
            userList.push(user.displayname);
        }
        io.emit('join', userList);

        // console.log("socket 접속")
        socket.on('client message', function(data){
            // console.log(data);
            // 연결된 모든 클라이언트에게 전달
            // io.emit('server message', data.message);
            io.emit('server message', {message : data.message, displayname : user.displayname});
        });

        socket.on('disconnect', function(){
            userList.removeByValue(user.displayname);
            // user.displayname을 넘겨주면 '~~가 나갔습니다.' 같은 메시지 출력 가능
            io.emit('leave', userList);
        });
    });
};