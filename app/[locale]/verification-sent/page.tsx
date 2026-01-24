export default function VerificationSentPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Verification Sent</h1>

      <p className="mt-4 text-gray-600">
        To make sure you used a valid email address, a verification email has
        been sent to your email address.
      </p>
      <p className="mt-4 text-gray-600">
        Please check your spam folder incase you can't find it.
      </p>
      <p className="mt-4 text-gray-600">
        If you haven't received it, please contact support.
      </p>
    </div>
  );
}
