import cv2
import boto3
import re
import os

frame_second = os.environ['frame_second']


def handler(event, context):
    print(event)

    s3_file_info = event['Records'][0]['s3']
    s3bucket = s3_file_info['bucket']['name']
    s3file = s3_file_info['object']['key']

    local_file = '/tmp/mp4file.mp4'
    local_output = '/tmp/jpgnail.jpg'

    s3 = boto3.resource('s3')
    s3.meta.client.download_file(s3bucket, s3file, local_file)

    target_nail_file = s3file.replace('.mp4', 'nail.jpg')
    print(target_nail_file)

    cameraCapture = cv2.VideoCapture(local_file)
    success, frame = cameraCapture.read()
    # 先截一帧，避免指定时间超过了视频
    cv2.imwrite(local_output, frame)
    while success:
        success, frame = cameraCapture.read()

        milliseconds = cameraCapture.get(cv2.CAP_PROP_POS_MSEC)

        seconds = milliseconds // 1000
        milliseconds = milliseconds % 1000

        if (int(frame_second) <= seconds):
            cv2.imwrite(local_output, frame)
            break
    cameraCapture.release()
    s3.meta.client.upload_file(local_output, s3bucket, target_nail_file)

    return {
    }
