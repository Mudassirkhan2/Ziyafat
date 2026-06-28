from unittest.mock import MagicMock, patch
from services.cloudinary_service import extract_public_id, delete_image


def test_extract_public_id_with_version():
    url = "https://res.cloudinary.com/mycloud/image/upload/v1234567890/ziyafat/org/slug-logo.jpg"
    assert extract_public_id(url) == "ziyafat/org/slug-logo"


def test_extract_public_id_without_version():
    url = "https://res.cloudinary.com/mycloud/image/upload/ziyafat/dishes/abc123def.png"
    assert extract_public_id(url) == "ziyafat/dishes/abc123def"


def test_extract_public_id_invalid_url():
    assert extract_public_id("https://example.com/some/image.jpg") is None


def test_extract_public_id_none_input():
    assert extract_public_id(None) is None


def test_delete_image_calls_destroy():
    with patch("services.cloudinary_service._get_cloudinary") as mock_get:
        mock_uploader = MagicMock()
        mock_get.return_value = mock_uploader
        delete_image("ziyafat/org/slug-logo")
        mock_uploader.destroy.assert_called_once_with(
            "ziyafat/org/slug-logo", invalidate=True, resource_type="image"
        )
