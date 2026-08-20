import logging
from models.Link import Link
from helpers.ai_tagger import suggest_tags
from helpers.metadata_scraper import fetch_link_metadata

logger = logging.getLogger(__name__)
def tag_link(link_id: str, url:str, user_id:str) -> None:
    try:
        link = Link.get_by_id(link_id=link_id, user_id=user_id)
        # Fetch link's metadata
        metadata = fetch_link_metadata(link.url)
        suggested_tags = suggest_tags(metadata=metadata, max_tags=4)

        link.update({"tags":suggest_tags})
    except Exception as e:
        logger.error(str(e))