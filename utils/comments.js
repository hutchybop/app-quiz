// Function to get the comment based on the score
function getComment(score) {

  let comment = "";

  if (score >= 96 && score <= 100) {
    comment = "Perfect score! Did you cheat? Be honest...";

  } else if (score >= 91 && score <= 95) {
    comment = "Excellent work! So close to perfection, it’s almost tragic.";

  } else if (score >= 86 && score <= 90) {
    comment = "Impressive! Just a few mistakes... that might haunt you forever.";

  } else if (score >= 81 && score <= 85) {
    comment = "You’ve got most of it down. But those mistakes? Unforgivable.";

  } else if (score >= 76 && score <= 80) {
    comment = "Nice job! Almost perfect. Almost.";

  } else if (score >= 71 && score <= 75) {
    comment = "You’re smarter than 75% of people who’ve taken this quiz. Or at least, 25% dumber.";

  } else if (score >= 66 && score <= 70) {
    comment = "You’re in the top two-thirds! Silver linings and all that.";

  } else if (score >= 61 && score <= 65) {
    comment = "Not bad. But not good enough to brag about. Unless you're desperate.";

  } else if (score >= 56 && score <= 60) {
    comment = "Better than average. But remember, average isn’t exactly great.";

  } else if (score >= 50 && score <= 55) {
    comment = "Just over half. Glass half full or half empty? Either way, it’s not full marks.";

  } else if (score >= 46 && score <= 49) {
    comment = "So close to 50%! That’s like, half right, half wrong. Half good, half bad. A mixed bag of meh.";

  } else if (score >= 41 && score <= 45) {
    comment = "Almost halfway there. You know, like to the end of a tragic comedy.";

  } else if (score >= 36 && score <= 40) {
    comment = "Statistically, you might be below average. But you’re above nothing!";

  } else if (score >= 31 && score <= 35) {
    comment = "Hey, at least you beat your high score in failure.";

  } else if (score >= 26 && score <= 30) {
    comment = "I’ve seen better scores in a kindergarten math test.";

  } else if (score >= 21 && score <= 25) {
    comment = "You’re on the right track... if the track is going the wrong way.";

  } else if (score >= 16 && score <= 20) {
    comment = "Guessing didn’t work out too well, did it?";

  } else if (score >= 11 && score <= 15) {
    comment = "Well, at least you tried. Did you though? Really?";

  } else if (score >= 6 && score <= 10) {
    comment = "Looks like you learned something today... just not from this quiz.";

  } else if (score >= 0 && score <= 5) {
    comment = "Did you even read the questions? Or did you just guess 'C' for everything?";

  } else {
    comment = "Please enter a valid score.";
  }
  return comment;
}

module.exports = getComment;
