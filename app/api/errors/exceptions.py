class APIError(Exception):
    """Base class for all exceptions"""
    code = 500
    description = "An error occured. Contact administrator"
    def __init__(self, *a, code=None, **kw):
        super().__init__(a[0] if a else self.description, *a[1:], **kw)
        # self.description = a[0] if a else self.description
        if code:
            self.code = code


class PreferenceError(APIError):
    pass


class PreferenceDoesNotExist(PreferenceError):
    code = 404
    description = "The preference key does not exist"


class BadSchemaError(APIError):
    code = 400
    description = "Invalid schema"


class AuthError(APIError):
    """Authentication errors"""
    code = 403


class LoginError(AuthError):
    """Error logging in"""
    code = 403


class PermissionDeniedError(AuthError):
    code = 403
    description = "You are not allowed to access this resource."


class TwoFactorCodeMissing(AuthError):
    """Error logging in"""
    code = 403
    description = "two factor login required"


class InvalidTokenError(AuthError):
    """Invalid API token"""
    code = 401
    description = "Invalid token/token not supplied"


class InvalidEmailTokenError(AuthError):
    """Invalid API token"""
    code = 400
    description = "Invalid token/token not supplied"


class PaginationError(APIError):
    code = 400


class InvalidPageError(PaginationError):
    """Invalid API page"""
    def __init__(self, nbpages, *a, **kw):
        super().__init__("Page given is out of range. Enter a value in"
                         f" the range [1, {nbpages}]", *a, **kw)