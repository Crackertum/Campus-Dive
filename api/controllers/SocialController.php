<?php
/**
 * Social Controller for shared/general social features
 */
class SocialController {

    public static function validateUrl(): void {
        $user = AuthMiddleware::handle();
        $url = trim($_GET['url'] ?? '');
        
        if (empty($url)) {
            Response::error('URL is required.', 400);
        }

        $result = UrlMediaService::validate($url);
        
        if (!$result['valid']) {
            Response::error($result['error'], 422);
        }

        $response = [
            'valid' => true,
            'type'  => $result['type'],
            'url'   => $url,
        ];

        if ($result['type'] === 'video') {
            $response['embed_url'] = UrlMediaService::toEmbedUrl($url);
        }

        Response::success($response);
    }
}
