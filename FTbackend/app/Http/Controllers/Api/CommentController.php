<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Attachment;
use App\Models\Task; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
class CommentController extends Controller
{
    public function __construct()
    {
        // Apply auth middleware for API (sanctum/token)
        // $this->middleware('auth:sanctum');
    }

    /**
     * Return all comments for the logged-in user (sent to or sent by them) 
     * with sender info, task info, and attachments.
     */
public function allComments()
{
    $userId = auth()->id(); 

    $comments = Comment::with([
        'task',
        'user',
        'recipient',
        'attachments'
    ])
    ->where('recipient_id', $userId) // filter by recipient
    ->get();
    return response()->json([
        'success' => true,
        'data' => $comments
    ]);
}

    /**
     * Store a new comment with optional attachments and recipient.
     */

    public function newComments(Request $request)
{
    $user = $request->user();
    
    $lastSeen = $user->last_seen_comments_at ?? $user->last_logout;

    $newComments = Comment::where('recipient_id', $user->id)
        ->when($lastSeen, fn($q) => $q->where('created_at', '>', $lastSeen))
        ->get();

    return response()->json([
        'new_comments_count' => $newComments->count(),
        'new_comments' => $newComments,
    ]);
}

public function markCommentsSeen(Request $request)
{
    $user = $request->user();
    $user->last_seen_comments_at = now();
    $user->save();
    return response()->json(['message' => 'Comments marked as seen']);
}

    public function store(Request $request, $taskId)
    {
        $request->validate([
            'comment_text' => 'nullable|string',
            'recipient_id' => 'required|exists:users,id',
            'attachments.*' => 'nullable|file|max:2048'
        ]);

        if (!$request->comment_text && !$request->hasFile('attachments')) {
            return response()->json(['error' => 'Comment text or file required'], 422);
        }

        $comment = Comment::create([
            'task_id' => $taskId,
            'user_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'comment_text' => $request->comment_text,
        ]);

        // Save attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('attachments', 'public');

                Attachment::create([
                    'comment_id' => $comment->id,
                    'file_url'   => $path,
                    'file_name'  => $file->getClientOriginalName(),
                ]);
            }
        }

        return response()->json($comment->load('user', 'task', 'attachments'), 201);
    }

    /**
     * Delete a comment and its attachments.
     */
    public function destroy($id)
    {
        $comment = Comment::with('attachments')->findOrFail($id);

        // Allow deletion if creator or admin
if (
    $comment->recipient_id !== Auth::id() &&    // not the recipient
    Auth::user()->role !== 'admin'              // not an admin
) {
    return response()->json(['error' => 'Unauthorized'], 403);
}


        // Delete attachments from storage
        foreach ($comment->attachments as $att) {
            Storage::disk('public')->delete($att->file_url);
            $att->delete();
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    /**
     * Download attachment.
     */
    public function downloadAttachment($id)
    {
        $attachment = Attachment::findOrFail($id);

        return Storage::disk('public')->download(
            $attachment->file_url,
            $attachment->file_name
        );
    }
}
