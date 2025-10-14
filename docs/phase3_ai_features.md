# Phase 3: AI Features & Advanced Functionality (Weeks 5-6)

## Step 3.1: AI-Powered Smart Filtering
- [x] Initialize SmartFilter class
  - [x] Store OpenAI API key
- [x] Implement `shouldForwardMessage` method
  - [x] Apply rule-based filtering (spam, irrelevance)
  - [x] Apply AI-based filtering for false positives
- [x] Implement `isSpam` method
  - [x] Define spam indicators
  - [x] Check message against spam indicators
- [x] Implement `isIrrelevant` method
  - [x] Define irrelevant patterns for keywords
  - [x] Check if keyword appears in irrelevant context
- [x] Implement `isFalsePositive` method
  - [x] Construct prompt for OpenAI API
  - [x] Call OpenAI API (gpt-3.5-turbo)
  - [x] Parse AI response ("YES"/"NO")
  - [x] Handle AI filtering errors
- [x] Implement `extractKeyInformation` method
  - [x] Construct prompt for OpenAI API to extract JSON
  - [x] Call OpenAI API (gpt-3.5-turbo)
  - [x] Parse JSON response (locations, entities, event_type, urgency)
  - [x] Handle AI extraction errors

## Step 3.2: Advanced Duplicate Detection
- [x] Initialize DuplicateDetector class
  - [x] Setup WordTokenizer, TfIdf from `natural`
  - [x] Set initial `similarityThreshold`
- [x] Implement `isDuplicate` method
  - [x] Fetch recent logs for the keyword (last 24 hours)
  - [x] Preprocess new message
  - [x] Iterate through recent logs
  - [x] Calculate similarity with existing messages
  - [x] Return true if similarity exceeds threshold
- [x] Implement `preprocessText` method
  - [x] Tokenize text
  - [x] Remove stop words (Persian)
  - [x] Stem words (Persian)
- [x] Implement `calculateSimilarity` method
  - [x] Use Jaro-Winkler distance for Persian text
- [x] Implement `updateSimilarityThreshold` method
  - [x] Adjust threshold based on user feedback ('too_many_duplicates', 'missed_duplicates')
  - [x] Save updated threshold to user preferences in database