/**
 * Hashtag parser — turns explicit `#tag` tokens into label tags.
 *
 * Without this, a typed `#work` / `#audit-probe` was left as literal text in
 * the title (nothing in the pipeline recognized the `#tag` shape), so quick-add
 * never produced the tag chips the seeded tasks show. This runs at a higher
 * priority than the priority/NLP parsers so `#urgent` reads as the label the
 * user asked for rather than being swallowed as a priority keyword — while a
 * bare `urgent` (no hash) still flows to the priority parser untouched.
 */

import { Parser, ParsedTag } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export class HashtagParser implements Parser {
  readonly id = 'hashtag-parser';
  readonly name = 'Hashtag Parser';
  // Above PriorityParser (8) and CompromiseNLPParser (6) so a hashtagged word
  // (e.g. `#urgent`, `#work`) wins the overlap and becomes a label, not a
  // priority/semantic guess. Below ChronoDateParser (10).
  readonly priority = 9;

  // `#` followed by a letter/number, then letters, numbers, `_` or `-`.
  // Matches `#work`, `#urgent`, `#audit-probe`; ignores a lone `#`.
  private readonly pattern = /#([A-Za-z0-9][A-Za-z0-9_-]*)/g;

  test(text: string): boolean {
    this.pattern.lastIndex = 0;
    return this.pattern.test(text);
  }

  parse(text: string): ParsedTag[] {
    const tags: ParsedTag[] = [];
    const seen = new Set<string>();
    this.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text)) !== null) {
      const raw = match[1];
      const value = raw.toLowerCase();

      // De-dupe repeated hashtags (`#work ... #work`) to a single chip.
      if (!seen.has(value)) {
        seen.add(value);
        tags.push({
          id: uuidv4(),
          type: 'label',
          value,
          displayText: raw.charAt(0).toUpperCase() + raw.slice(1),
          iconName: 'Tag',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          originalText: match[0],
          confidence: 0.95,
          source: this.id,
          color: '#8b5cf6',
        });
      }

      if (this.pattern.lastIndex === match.index) this.pattern.lastIndex += 1;
    }

    return tags;
  }
}
