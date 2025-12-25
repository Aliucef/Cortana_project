from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from models.news import NewsPreference
from api.schemas import NewsPreferenceCreate, NewsPreferenceResponse

router = APIRouter(prefix="/news", tags=["news"])


@router.post("/preferences", response_model=NewsPreferenceResponse, status_code=status.HTTP_201_CREATED)
def create_news_preference(
    preference: NewsPreferenceCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Create or update news preferences for a user"""
    # Check if preferences already exist
    existing = db.query(NewsPreference).filter(NewsPreference.user_id == user_id).first()

    if existing:
        # Update existing preferences
        existing.categories = preference.categories
        existing.keywords = preference.keywords
        existing.country = preference.country
        existing.language = preference.language
        existing.morning_summary_enabled = preference.morning_summary_enabled
        existing.preferred_time = preference.preferred_time

        db.commit()
        db.refresh(existing)
        return existing

    # Create new preferences
    db_preference = NewsPreference(
        user_id=user_id,
        categories=preference.categories,
        keywords=preference.keywords,
        country=preference.country,
        language=preference.language,
        morning_summary_enabled=preference.morning_summary_enabled,
        preferred_time=preference.preferred_time
    )

    db.add(db_preference)
    db.commit()
    db.refresh(db_preference)

    return db_preference


@router.get("/preferences/{user_id}", response_model=NewsPreferenceResponse)
def get_news_preferences(user_id: int, db: Session = Depends(get_db)):
    """Get news preferences for a user"""
    preference = db.query(NewsPreference).filter(NewsPreference.user_id == user_id).first()
    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News preferences not found for this user"
        )
    return preference


@router.delete("/preferences/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news_preferences(user_id: int, db: Session = Depends(get_db)):
    """Delete news preferences for a user"""
    preference = db.query(NewsPreference).filter(NewsPreference.user_id == user_id).first()
    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News preferences not found for this user"
        )

    db.delete(preference)
    db.commit()
    return None
