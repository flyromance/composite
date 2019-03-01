cd /root/workspace

rm -rf composite

mkdir composite

tar -xzf composite.temp.tar.gz -C ./composite 

chmod -R 755 composite

# 修改用户组
# chown -R root:root composite

rm -rf composite.temp.tar.gz