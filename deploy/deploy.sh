# 压缩
tar -czf composite.temp.tar.gz *

# 上传
scp composite.temp.tar.gz root@39.105.61.15:/root/workspace

rm -rf composite.temp.tar.gz

# 登录
ssh root@39.105.61.15 < remote_operation.sh


