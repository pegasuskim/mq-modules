# mq-modules test

apt-get install rabbitmq-server

vi /etc/rabbitmq/enabled_plugins

enabled_plugins in file   [rabbitmq_management] .  write and ave

http://localhost:55672    -> (Admin Page)

#login
guest/guest

git clone https://github.com/pegasuskim/rabbitmq-publisher.git

npm install

cd test

node pub-sub-test.js

node routing-test.js

node topics-test.js

node workq-test.js

