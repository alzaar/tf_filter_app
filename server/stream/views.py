import os
from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

# from matplotlib import gridspec
# import matplotlib.pylab as plt
import tensorflow as tf
import tensorflow_hub as tf_hub

import numpy as np
import PIL


def load_image(image_path, image_size=(512, 256)):
    img = tf.io.decode_image(tf.io.read_file(image_path), channels=3, dtype=tf.float32)[
        tf.newaxis, ...
    ]
    img = tf.image.resize(img, image_size, preserve_aspect_ratio=True)
    return img


def handle_upload_file(file, image):
    with open(image, "wb+") as destination:
        for chunk in file.chunks():
            destination.write(chunk)


def stylize_image(original_image, style_image):
    original_image = load_image(original_image)
    style_image = load_image(style_image)

    style_image = tf.nn.avg_pool(style_image, ksize=[3,3], strides=[1,1], padding='VALID')

    stylize_model = tf_hub.load('tf_model')

    results = stylize_model(tf.constant(original_image), tf.constant(style_image))
    return results[0]

def export_image(tf_img):
    tf_img = tf_img*255
    tf_img = np.array(tf_img, dtype=np.uint8)
    if np.ndim(tf_img)>3:
        assert tf_img.shape[0] == 1
        img = tf_img[0]
    return PIL.Image.fromarray(img)

def index(request):
    original_image = None
    style_image = None

    files = request.FILES.getlist("files")
    images = [
        ("stream/tmp/original_image", files[0]),
        ("stream/tmp/style_image", files[1]),
    ]

    for image_path, file in images:
        _, extension = os.path.splitext(file.name)
        full_image_path = image_path + extension
        handle_upload_file(file, full_image_path)
        if not original_image:
            original_image = full_image_path
        if not style_image:
            style_image = full_image_path

    output = stylize_image(original_image, style_image)
    export_image(output).save("stream/tmp/output.png")
    return JsonResponse(dict(hi="world"))
