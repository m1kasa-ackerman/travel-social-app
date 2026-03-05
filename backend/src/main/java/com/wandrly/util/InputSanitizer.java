package com.wandrly.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    // Basic safe list: allows b, i, em, strong, ul, ol, li, p, br — strips
    // scripts/iframes
    private static final Safelist BASIC_SAFE = Safelist.basicWithImages();

    /**
     * For HTML-allowed fields (post body, bio) — strips scripts, keeps formatting
     */
    public String sanitizeHtml(String input) {
        if (input == null)
            return null;
        return Jsoup.clean(input, BASIC_SAFE);
    }

    /** For plain text fields — strip ALL tags and dangerous chars */
    public String sanitizePlainText(String input) {
        if (input == null)
            return null;
        return Jsoup.clean(input, Safelist.none())
                .replaceAll("[<>\"'%;()&+]", "")
                .trim();
    }
}
