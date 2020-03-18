const AWS = require('aws-sdk');
const s3 = new AWS.S3();

class S3Storage {
  constructor(config, log) {
    this.bucket = config.s3_bucket;
    this.log = log;
    const aws_config = {
      s3ForcePathStyle: config.s3_force_path_style
    }

    if (config.s3_endpoint != '') {
      aws_config.endpoint = config.s3_endpoint;
      console.log('Using endpoint: ', aws_config.endpoint);
    }

    AWS.config.update(aws_config);
  }

  async length(id) {
    const result = await s3
      .headObject({ Bucket: this.bucket, Key: id })
      .promise();
    return result.ContentLength;
  }

  getStream(id) {
    return s3.getObject({ Bucket: this.bucket, Key: id }).createReadStream();
  }

  set(id, file) {
    const upload = s3.upload({
      Bucket: this.bucket,
      Key: id,
      Body: file
    });
    file.on('error', () => upload.abort());
    return upload.promise();
  }

  del(id) {
    return s3.deleteObject({ Bucket: this.bucket, Key: id }).promise();
  }

  ping() {
    return s3.headBucket({ Bucket: this.bucket }).promise();
  }
}

module.exports = S3Storage;
