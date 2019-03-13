# 压缩
tar -czf composite.temp.tar.gz *

# 上传
scp composite.temp.tar.gz root@39.105.61.15:/root/workspace

# 删除
rm -rf composite.temp.tar.gz

# 执行远程操作
ssh root@39.105.61.15 < remote_operation.sh


