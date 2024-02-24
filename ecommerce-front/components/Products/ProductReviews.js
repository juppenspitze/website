import { Input } from "@/components/ui/input";
import StarsRating from "@/components/Products/StarsRating";
import { Textarea } from "@/components/ui/textarea";
import {useEffect, useState} from "react";
import axios from "axios";
import Spinner from "@/components/Globals/Spinner";
import {signIn} from "next-auth/react";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

export default function ProductReviews({product, user}) {
  const tProductReviews = useTranslations('Products.Reviews');
  const tReviewsButtons = useTranslations('Buttons');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [madeComment, setMadeComment] = useState(false);
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [stars,setStars] = useState(0);
  const [reviews,setReviews] = useState([]);
  const [reviewsLoading,setReviewsLoading] = useState(false);

  useEffect(() => {
    if (user) setIsLoggedIn(true);
    loadReviews();
  }, []);

  async function login() {
    await signIn('google');
  };
  function submitReview() {
    if (!user) return
    let authorName = user.name;
    let authorImg = user.image;
    let authorEmail = user.email;
    const data = {authorName,authorImg,authorEmail,title,description,stars,product:product._id};
    if (title) {
      axios.post('/api/reviews', data).then(res => {
        setDescription('');
        setStars(0);
        loadReviews();
      });
    }
  }
  function loadReviews() {
    setReviewsLoading(true);
    axios.get('/api/reviews?product='+product._id).then(res => {
      setReviews(res.data);
      setReviewsLoading(false);
      if (user) {
        let madeReview = res.data.find((review) => review.authorEmail === user.email);
        if (!madeReview) {
          setMadeComment(false);
        } else { setMadeComment(true) }
      }
    });
  }
  return (
    <div>
      <h2 className="mb-1.5">{tProductReviews('reviews')}</h2>
      <div className="flex flex-1 max-sm:flex-col sm:items-center sm:justify-between gap-6">
        {!madeComment && (
          <div>
            <div className="bg-white rounded-lg p-7">
              <h3 className="mt-1.5">{tReviewsButtons('add_review')}</h3>
              {isLoggedIn ? (<>
                <div>
                  <StarsRating onChange={setStars} />
                </div>
                <Input
                  value={title}
                  onChange={ev => setTitle(ev.target.value)}
                  placeholder="Title" />
                <Textarea
                  value={description}
                  onChange={ev => setDescription(ev.target.value)}
                  placeholder="Was it good? Pros? Cons?" />
                <div className="mt-4">
                  <Button onClick={submitReview}>{tReviewsButtons('leave_review')}</Button>
                </div>
              </>) : (<>
                <div>{tProductReviews('to_leave_review_description')}</div>
                <Button onClick={login}>{tReviewsButtons('login_with_google')}</Button>
              </>)}
            </div>
          </div>
        )}
        <div className="flex-1 h-full mb-auto">
          <div className="bg-white rounded-lg p-7">
            <h3 className="mt-1.5">{tProductReviews('all_reviews')}</h3>
            {reviewsLoading && (
              <Spinner fullwidth={true} />
            )}
            {reviews.length === 0 && (
              <p>{tProductReviews('no_reviews')}</p>
            )}
            {reviews.length > 0 && reviews.map(review => (
              <div className="mb-2.5 py-2.5 px-0 border-t border-solid border-[#eee] [&>p]:text-[#555] [&>p]:text-xs" key={review._id}>
                <div className="flex justify-between">
                  <StarsRating size={'sm'} disabled={true} defaultHowMany={review.stars} />
                  <time className="text-xs text-[#aaa]">{(new Date(review.createdAt)).toLocaleString('sv-SE')}</time>
                </div>
                <p>{review.authorName}</p>
                <h3 className="my-[3px] text-[#333]">{review.title}</h3>
                <p>{review.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}