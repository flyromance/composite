# 压缩
tar -czf composite.temp.tar.gz *.*

# 上传
scp composite.temp.tar.gz root@39.105.61.15:/root/workspace

# 登录
ssh root@39.105.61.15

# 解压到文件目录
cd /root/workspace

# 删除原来的composite文件夹
rm -rf composite

tar -xf composite.temp.tar.gz 

rm -rf composite.temp.tar.gz
