import re

def sanitize_html(html_str: str) -> str:
    if not html_str:
        return ""
    
    # 1. Strip script tags (case-insensitive)
    clean = re.sub(r'(?i)<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html_str)
    
    # 2. Strip inline event handlers (e.g. onload, onerror, onclick, onmouseover)
    clean = re.sub(r'(?i)\bon[a-z]+\s*=\s*(["\'])(.*?)\1', '', clean)
    clean = re.sub(r'(?i)\bon[a-z]+\s*=\s*([^\s>]+)', '', clean) # unquoted handlers
    
    # 3. Strip javascript: protocol links
    clean = re.sub(r'(?i)\bhref\s*=\s*(["\'])\s*javascript:(.*?)\1', 'href="#"', clean)
    clean = re.sub(r'(?i)\bhref\s*=\s*([^\s>]+javascript:[^\s>]+)', 'href="#"', clean)
    
    # 4. Strip iframe or embed/object tags that can execute flash/externals
    clean = re.sub(r'(?i)<(iframe|object|embed|form)\b[^<]*(?:(?!\/iframe|\/object|\/embed|\/form)<\/[a-zA-Z]*>)?', '', clean)
    
    return clean
