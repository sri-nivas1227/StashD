from metadata_scraper import fetch_link_metadata
from ai_tagger import suggest_tags

links = ["https://a.co/d/05vxEOKs","https://share.google/9mCsGZXcJT85X0e2I","https://dl.flipkart.com/dl/cubonic-1080p-q28-2x-wifi-access-camera-1080p-hd-120-wide-angle-360-rotating-sports-action-camera/p/itm50e5c11327d3e?pid=SAYH5H8STY9MFETP&lid=LSTSAYH5H8STY9MFETPTPCBPY&marketplace=FLIPKART&cmpid=content_sports-action-camera_8965229628_gmc&utm_content=YT3-p6G-OMhnWnvQG975n4Tw4QAkcK0YCVHFlXFLMceCK_0fZLBsNccYfCeMV3YLk0C-xq0Q62urv10SEMqOodeLz7XE&utm_medium=product_shelf&utm_source=youtube&_refId=&_appId=CL","https://posthog.com/?thumbnails=false&notes=false&form=true&t=1&utm_source=google&utm_medium=cpc&utm_campaign=brand_campaign&utm_content=pure-brand&utm_term=posthog&utm_campaign=brand_campaign&gad_source=1&gad_campaignid=14595943566&gclid=CjwKCAjw6MPRBhBTEiwAd-7Mr5UXpl6fRV8Wlt6DJY7FPUBXF0Z-Fzc94ddaOjhgiVuxeZiVYrlsqBoCFywQAvD_BwE","https://youtu.be/L2ehWbxphKc?si=8uWhl2t_UrZmJEAd"]

tags_object = dict()
for link in links:
    metadata = fetch_link_metadata(link)
    tags = suggest_tags(metadata=metadata, max_tags=4)
    tags_object[link] = tags

print(tags_object)