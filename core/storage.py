from whitenoise.storage import CompressedManifestStaticFilesStorage


class ForgivingManifestStorage(CompressedManifestStaticFilesStorage):
    """WhiteNoise compressed + hashed storage that tolerates dangling references.

    The vendored admin/theme CSS references files (``.map`` source maps,
    ``assets/img/*.svg``) that are not shipped in ``static/``. Django's
    post-processing would abort ``collectstatic`` with a MissingFileError, so a
    reference that cannot be resolved is left as-is instead of being hashed.
    """

    manifest_strict = False

    def hashed_name(self, name, content=None, filename=None):
        try:
            return super().hashed_name(name, content, filename)
        except ValueError:
            return name
